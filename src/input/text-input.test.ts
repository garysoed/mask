import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getHarness} from 'persona/export/testing';

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
      const element = _.tester.bootstrapElement(TEXT_INPUT);
      element.textContent = 'Label';
      element.setValue('initValue');

      assert(element).to.matchSnapshot('text-input__init_value.html');
    });
  });

  test('domValue$', () => {
    should('emit the correct value', () => {
      const value = 'value';

      const element = _.tester.bootstrapElement(TEXT_INPUT);
      element.textContent = 'Label';

      const harness = getHarness(element, TextInputHarness);
      harness.simulateTextInput(value);

      assert(element.value).to.equal(value);
      assert(element).to.matchSnapshot('text-input__value.html');
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 'value';

      const element = _.tester.bootstrapElement(TEXT_INPUT);
      element.textContent = 'Label';
      element.setValue(value);

      assert(element).to.matchSnapshot('text-input__update.html');
    });
  });
});
