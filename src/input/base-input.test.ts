import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {Context, DIV, iattr, oattr, oflag, query, registerCustomElement} from 'persona';
import {ElementHarness, getHarness} from 'persona/export/testing';
import {BehaviorSubject, Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {$baseRootOutputs} from '../action/base-action';
import {ActionEvent} from '../event/action-event';
import {setupThemedTest} from '../testing/setup-themed-test';

import {BaseInput, create$baseInput} from './base-input';
import goldens from './goldens/goldens.json';


const $test = {
  host: {
    ...create$baseInput<string>('').host,
  },
  shadow: {
    div: query('#div', DIV, {
      ...$baseRootOutputs,
      disabled: oflag('disabled'),
      label: oattr('label'),
      attrIn: iattr('value'),
      attrOut: oattr('value'),
    }),
  },
};

class TestInput extends BaseInput<string> {
  constructor(private readonly $: Context<typeof $test>) {
    super(
        $,
        $.shadow.div.disabled,
        $.shadow.div,
    );
  }

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


test('@mask/src/input/base-input', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/input/goldens', goldens));
    const tester = setupThemedTest({roots: [TEST]});
    return {tester};
  });

  test('bindFromHost', () => {
    should('set the init value', () => {
      const value$ = new BehaviorSubject('a');
      const element = _.tester.bootstrapElement(TEST);
      element.value = value$;

      assert(snapshotElement(element)).to.match('base-input__init_from_host.golden');
    });

    should('reflect the value from the host', () => {
      const value$ = new BehaviorSubject('a');
      const element = _.tester.bootstrapElement(TEST);
      element.value = value$;

      value$.next('b');

      assert(snapshotElement(element)).to.match('base-input__from_host.golden');
    });
  });

  test('bindFromDom', () => {
    should('skip the init value', () => {
      const value$ = new BehaviorSubject('a');
      const element = _.tester.bootstrapElement(TEST);
      getHarness(element, '#div', ElementHarness).target.setAttribute('value', 'init');

      element.value = value$;

      assert(value$).to.emitWith('a');
    });

    should('reflect the value from the dom', () => {
      const value$ = new BehaviorSubject('a');
      const element = _.tester.bootstrapElement(TEST);
      getHarness(element, '#div', ElementHarness).target.setAttribute('value', 'init');

      element.value = value$;

      const newValue = 'newValue';
      getHarness(element, '#div', ElementHarness).target.setAttribute('value', newValue);

      assert(value$).to.emitWith(newValue);
    });
  });
});
