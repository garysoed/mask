import {$stateService, source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {mutableState} from 'gs-tools/export/state';
import {stringType} from 'gs-types';
import {Context, Ctrl, DIV, iattr, query, oattr, oflag, registerCustomElement} from 'persona';
import {ElementHarness, getHarness} from 'persona/export/testing';
import {Observable, of, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {$baseRootOutputs} from '../action/base-action';
import {ActionEvent} from '../event/action-event';
import {BaseInput, create$baseInput} from '../input/base-input';
import {setupThemedTest} from '../testing/setup-themed-test';

import {bindInputToState} from './bind-input-to-state';
import goldens from './goldens/goldens.json';


const DEFAULT = 'default';
const $value = source(vine => $stateService.get(vine).addRoot(mutableState(DEFAULT)).$());

const $test = {
  host: {
    ...create$baseInput<string, string>(stringType, '').host,
  },
  shadow: {
    div: query('#div', DIV, {
      ...$baseRootOutputs,
      disabled: oflag('disabled'),
      attrIn: iattr('value'),
      attrOut: oattr('value'),
    }),
  },
};

class TestInput extends BaseInput<string, string> {
  constructor(private readonly $: Context<typeof $test>) {
    super(
        $,
        $.shadow.div.disabled,
        $.shadow.div,
    );
  }

  @cache()
  get onAction$(): Observable<ActionEvent<string>> {
    return this.domValue$.pipe(map(value => new ActionEvent(value)));
  }

  @cache()
  protected get domValue$(): Observable<string> {
    return this.$.shadow.div.attrIn.pipe(mapNullableTo(''));
  }

  protected updateDomValue(): OperatorFunction<string, unknown> {
    return this.$.shadow.div.attrOut();
  }
}

const TEST = registerCustomElement({
  ctrl: TestInput,
  spec: $test,
  tag: 'mk-test-base-input',
  template: '<div id="div"></div>',
});

const $parent = {
  shadow: {
    test: query('#test', TEST),
  },
};

class Parent implements Ctrl {
  constructor(private readonly $: Context<typeof $parent>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      bindInputToState($value.get(this.$.vine), this.$.shadow.test),
    ];
  }
}

const PARENT = registerCustomElement({
  ctrl: Parent,
  deps: [TEST],
  spec: $parent,
  tag: 'mk-test-parent',
  template: '<mk-test-base-input id="test"></mk-test-base-input>',
});


test('@mask/src/util/bind-input-to-state', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/util/goldens', goldens));
    const tester = setupThemedTest({roots: [PARENT]});
    return {tester};
  });

  should('sync only the initial value of the state to the DOM correctly', () => {
    const element = _.tester.createElement(PARENT);

    assert(element).to.matchSnapshot('bind-input-to-state__init.html');

    of('newValue')
        .pipe($value.get(_.tester.vine).set())
        .subscribe();

    // There should be no change.
    assert(element).to.matchSnapshot('bind-input-to-state__init.html');
  });

  should('sync values from DOM to state correctly', () => {
    const element = _.tester.createElement(PARENT);
    const newValue = 'newValue';

    getHarness(
        getHarness(element, '#test', ElementHarness).target,
        '#div',
        ElementHarness,
    ).target.setAttribute('value', newValue);

    assert($value.get(_.tester.vine)).to.emitSequence([newValue]);
  });
});
