import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {flattenNode, getEl, setupTest} from 'persona/export/testing';

import {CHECKBOX} from '../input/checkbox';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';


test('@mask/src/input/checkbox', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/input/goldens', goldens));

    const tester = setupTest({
      roots: [CHECKBOX],
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
      ],
    });

    return {tester};
  });

  test('render', () => {
    should('render default config correctly', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';

      assert(flattenNode(element)).to.matchSnapshot('checkbox__default.html');
    });

    should('render disabled checkbox correctly', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';
      element.setAttribute('mk-disabled', '');

      assert(flattenNode(element)).to.matchSnapshot('checkbox__disabled.html');
    });
  });

  test('checkMode$', () => {
    should('set the classlist to display_checked if checked', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';
      element.initValue = true;
      element.clearFn(undefined);

      assert(flattenNode(element)).to.matchSnapshot('checkbox__checked.html');
    });

    should('set the classlist to display_unchecked if unchecked', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';
      element.initValue = false;
      element.clearFn(undefined);

      assert(flattenNode(element)).to.matchSnapshot('checkbox__unchecked.html');
    });

    should('set the classlist to display_unknown if unknown', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';
      element.initValue = null;
      element.clearFn(undefined);

      assert(flattenNode(element)).to.matchSnapshot('checkbox__unknown.html');
    });
  });

  test('domValue$', () => {
    should('react to change events', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';

      const inputEl = getEl(element, 'input')!;
      inputEl.simulateChange(el => {
        el.indeterminate = false;
        el.checked = true;
      });

      assert(flattenNode(element)).to.matchSnapshot('checkbox__change-to-checked.html');
    });

    should('react to clear function', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';
      element.initValue = true;
      element.clearFn(undefined);

      assert(flattenNode(element)).to.matchSnapshot('checkbox__clear-to-checked.html');
    });
  });

  test('updateDomValue', () => {
    should('set update the DOM value correctly when checked', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';
      element.initValue = true;
      element.clearFn(undefined);

      const inputEl = getEl(element, 'input')! as unknown as HTMLInputElement;
      assert(inputEl.indeterminate).to.beFalse();
      assert(inputEl.checked).to.beTrue();
    });

    should('set update the DOM value correctly when unchecked', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';
      element.initValue = false;
      element.clearFn(undefined);

      const inputEl = getEl(element, 'input')! as unknown as HTMLInputElement;
      assert(inputEl.indeterminate).to.beFalse();
      assert(inputEl.checked).to.beFalse();
    });

    should('set unknown value correctly', () => {
      const element = _.tester.createElement(CHECKBOX);
      element.textContent = 'Label';
      element.initValue = null;
      element.clearFn(undefined);

      const inputEl = getEl(element, 'input')! as unknown as HTMLInputElement;
      assert(inputEl.indeterminate).to.beTrue();
      assert(inputEl.checked).to.beFalse();
    });
  });
});
