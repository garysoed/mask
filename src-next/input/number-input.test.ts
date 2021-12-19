import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getEl} from 'persona/export/testing';

import {setupThemedTest} from '../testing/setup-themed-test';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {NUMBER_INPUT} from './number-input';


test('@mask/src/input/number-input', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/input/goldens', goldens));
    const tester = setupThemedTest({
      roots: [NUMBER_INPUT],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });

    return {tester};
  });

  test('domValue$', () => {
    should('emit the correct value', () => {
      const value = 123;

      const element = _.tester.createElement(NUMBER_INPUT);
      element.textContent = 'Label';
      element.initValue = 98;

      const inputEl = getEl(element, 'input')!;
      inputEl.simulateChange(el => {
        el.value = `${value}`;
      });

      assert(element.value).to.equal(value);
      assert(element).to.matchSnapshot('number-input__value.html');
    });
  });

  test('hideStepperIcon', () => {
    should('show stepper icon when hovered', () => {
      const element = _.tester.createElement(NUMBER_INPUT);
      element.textContent = 'Label';
      element.initValue = 98;

      const inputEl = getEl(element, 'input')!;
      inputEl.simulateMouseOver();

      assert(element).to.matchSnapshot('number-input__show-stepper.html');
    });

    should('hide stepper icon on mouseleave', () => {
      const element = _.tester.createElement(NUMBER_INPUT);
      element.textContent = 'Label';
      element.initValue = 98;

      const inputEl = getEl(element, 'input')!;
      inputEl.simulateMouseOver();
      inputEl.simulateMouseOut();

      assert(element).to.matchSnapshot('number-input__hide-stepper.html');
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 123;

      const element = _.tester.createElement(NUMBER_INPUT);
      element.textContent = 'Label';
      element.initValue = value;
      element.clearFn(undefined);

      assert(element).to.matchSnapshot('number-input__update.html');
    });

    should('set null value correctly', () => {
      const element = _.tester.createElement(NUMBER_INPUT);
      element.textContent = 'Label';
      element.initValue = null;
      element.clearFn(undefined);

      assert(element).to.matchSnapshot('number-input__update-null.html');
    });
  });
});
