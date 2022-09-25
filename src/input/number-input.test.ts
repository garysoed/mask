import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getHarness} from 'persona/export/testing';

import {setupThemedTest} from '../testing/setup-themed-test';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {NUMBER_INPUT} from './number-input';
import {NumberInputHarness} from './testing/number-input-harness';


test('@mask/src/input/number-input', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/input/goldens', goldens));
    const tester = setupThemedTest({
      roots: [NUMBER_INPUT],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });

    return {tester};
  });

  test('domValue$', () => {
    should('emit the correct value', () => {
      const value = 123;

      const element = _.tester.bootstrapElement(NUMBER_INPUT);
      element.textContent = 'Label';

      const harness = getHarness(element, NumberInputHarness);
      harness.simulateNumberInput(value);

      assert(element.value).to.equal(value);
      assert(element).to.matchSnapshot('number-input__value.html');
    });
  });

  test('hideStepperIcon', () => {
    should('show stepper icon when hovered', () => {
      const element = _.tester.bootstrapElement(NUMBER_INPUT);
      element.textContent = 'Label';

      const harness = getHarness(element, NumberInputHarness);
      harness.simulateMouseOver();

      assert(element).to.matchSnapshot('number-input__show-stepper.html');
    });

    should('hide stepper icon on mouseleave', () => {
      const element = _.tester.bootstrapElement(NUMBER_INPUT);
      element.textContent = 'Label';

      const harness = getHarness(element, NumberInputHarness);
      harness.simulateMouseOver();
      harness.simulateMouseOut();

      assert(element).to.matchSnapshot('number-input__hide-stepper.html');
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 123;

      const element = _.tester.bootstrapElement(NUMBER_INPUT);
      element.textContent = 'Label';
      element.setValue(value);

      assert(element).to.matchSnapshot('number-input__update.html');
    });

    should('set null value correctly', () => {
      const element = _.tester.bootstrapElement(NUMBER_INPUT);
      element.textContent = 'Label';
      element.setValue(null);

      assert(element).to.matchSnapshot('number-input__update-null.html');
    });
  });
});
