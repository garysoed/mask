import {assert, createSpySubject, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {stringType} from 'gs-types';
import {Context, DIV, iattr, id, oattr, registerCustomElement} from 'persona';
import {getEl} from 'persona/export/testing';
import {oflag} from 'persona/src/output/flag';
import {fromEvent, Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {$baseRootOutputs} from '../action/base-action';
import {ActionEvent} from '../event/action-event';
import {ChangeEvent, CHANGE_EVENT} from '../event/change-event';
import {setupThemedTest} from '../testing/setup-themed-test';

import {BaseInput, create$baseInput} from './base-input';
import goldens from './goldens/goldens.json';


const $test = {
  host: {
    ...create$baseInput<string, string>(stringType, '').host,
  },
  shadow: {
    div: id('div', DIV, {
      ...$baseRootOutputs,
      disabled: oflag('disabled'),
      label: oattr('label'),
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


test('@mask/src/input/base-input', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/input/goldens', goldens));
    const tester = setupThemedTest({roots: [TEST]});
    return {tester};
  });

  test('handleOnClear$', () => {
    should('set the DOM value and the output values to the init value', () => {
      const initValue = 'initValue';
      const element = _.tester.createElement(TEST);
      element.initValue = initValue;
      element.clearFn(undefined);

      assert(element).to.matchSnapshot('base-input__clear.html');
      assert(element.value).to.equal(initValue);
    });

    should('set the DOM value and output values to the init value at the start', () => {
      const element = _.tester.createElement(TEST);

      assert(element).to.matchSnapshot('base-input__init.html');
      assert(element.value).to.equal('');
    });
  });

  test('onChange$', () => {
    should('emit the old value if dom value changes', () => {
      const newValue = 'newValue';
      const element = _.tester.createElement(TEST);
      const event$ = createSpySubject(fromEvent<ChangeEvent<string>>(element, CHANGE_EVENT));

      getEl(element, 'div')!.setAttribute('value', newValue);

      assert(element.value).to.equal(newValue);
      assert(event$.pipe(map(event => event.oldValue))).to.emitSequence(['']);
    });

    should('not emit if the dom value does not change', () => {
      const newValue = 'newValue';
      const element = _.tester.createElement(TEST);

      getEl(element, 'div')!.setAttribute('value', newValue);
      const event$ = createSpySubject(fromEvent<ChangeEvent<string>>(element, CHANGE_EVENT));
      getEl(element, 'div')!.setAttribute('value', newValue);

      assert(element.value).to.equal(newValue);
      assert(event$.pipe(map(event => event.oldValue))).to.emitSequence([]);
    });
  });
});
