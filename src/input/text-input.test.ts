import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {getHarness} from 'persona/export/testing';
import {BehaviorSubject, ReplaySubject} from 'rxjs';

import {setupThemedTest} from '../testing/setup-themed-test';

import goldens from './goldens/goldens.json';
import {TextInputHarness} from './testing/text-input-harness';
import {TEXT_INPUT} from './text-input';


test('@mask/src/input/text-input', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/input/goldens', goldens));
    const tester = setupThemedTest({
      roots: [TEXT_INPUT],
    });
    return {tester};
  });

  test('render', () => {
    should('render the value correctly', () => {
      const value$ = new BehaviorSubject('initValue');
      const element = _.tester.bootstrapElement(TEXT_INPUT);
      element.textContent = 'Label';
      element.value = value$;

      assert(snapshotElement(element)).to.match('text-input__init_value.golden');
    });
  });

  test('domValue$', () => {
    should('emit the correct value', () => {
      const value = 'value';
      const value$ = new ReplaySubject<string>(1);

      const element = _.tester.bootstrapElement(TEXT_INPUT);
      element.value = value$;
      element.textContent = 'Label';

      const harness = getHarness(element, TextInputHarness);
      harness.simulateTextInput(value);

      assert(value$).to.emitWith(value);
      assert(snapshotElement(element)).to.match('text-input__value.golden');
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 'value';
      const value$ = new ReplaySubject<string>(1);

      const element = _.tester.bootstrapElement(TEXT_INPUT);
      element.textContent = 'Label';
      element.value = value$;
      value$.next(value);

      assert(snapshotElement(element)).to.match('text-input__update.golden');
    });
  });
});
