import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getEl} from 'persona/export/testing';

import {setupThemedTest} from '../testing/setup-themed-test';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {TEXT_INPUT} from './text-input';


test('@mask/src/input/text-input', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/input/goldens', goldens));
    const tester = setupThemedTest({
      roots: [TEXT_INPUT],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    return {tester};
  });

  test('render', () => {
    should('render the value correctly', () => {
      const element = _.tester.createElement(TEXT_INPUT);
      element.textContent = 'Label';
      element.initValue = 'initValue';
      element.clearFn(undefined);

      assert(element).to.matchSnapshot('text-input__init_value.html');
    });
  });

  test('domValue$', () => {
    should('emit the correct value', () => {
      const value = 'value';

      const element = _.tester.createElement(TEXT_INPUT);
      element.textContent = 'Label';
      element.initValue = 'initValue';

      const inputEl = getEl(element, 'input')!;
      inputEl.simulateChange(el => {
        el.value = value;
      });

      assert(element.value).to.equal(value);
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 'value';

      const element = _.tester.createElement(TEXT_INPUT);
      element.textContent = 'Label';
      element.initValue = value;
      element.clearFn(undefined);

      const inputEl = getEl(element, 'input')! as any as HTMLInputElement;
      assert(inputEl.value).to.equal(value);

      assert(element).to.matchSnapshot('text-input__update.html');
    });
  });
});
