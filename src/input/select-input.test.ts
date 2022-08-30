import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getHarness} from 'persona/export/testing';

import {OVERLAY} from '../core/overlay';
import {setupThemedTest} from '../testing/setup-themed-test';

import goldens from './goldens/goldens.json';
import {SELECT_INPUT} from './select-input';
import {OverlayHarness} from './testing/overlay-harness';
import {SelectInputHarness} from './testing/select-input-harness';
import {SelectOptionHarness} from './testing/select-option-harness';

test('@mask/src/input/select-input', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/input/goldens', goldens));
    const tester = setupThemedTest({
      roots: [SELECT_INPUT, OVERLAY],
    });
    return {tester};
  });

  test('render', () => {
    should('render the value correctly', () => {
      const element = _.tester.bootstrapElement(SELECT_INPUT);
      element.textContent = 'Label';
      element.options = [
        {text: 'Option 1', key: '1'},
        {text: 'Option 2', key: '2'},
        {text: 'Option 3', key: '3'},
      ];
      element.initValue = '2';
      element.clearFn(undefined);

      assert(element).to.matchSnapshot('select-input__init_value.html');

      // Check the overlay.
      const harness = getHarness(element, SelectInputHarness);
      harness.simulateOpenOptions();
      const overlay = _.tester.bootstrapElement(OVERLAY);

      assert(overlay).to.matchSnapshot('select-input__init_value_overlay.html');
    });

    should('render null value correctly', () => {
      const element = _.tester.bootstrapElement(SELECT_INPUT);
      element.textContent = 'Label';
      element.options = [
        {text: 'Option 1', key: '1'},
        {text: 'Option 2', key: '2'},
        {text: 'Option 3', key: '3'},
      ];
      element.initValue = null;
      element.clearFn(undefined);

      assert(element).to.matchSnapshot('select-input__null_value.html');

      // Check the overlay.
      const harness = getHarness(element, SelectInputHarness);
      harness.simulateOpenOptions();
      const overlay = _.tester.bootstrapElement(OVERLAY);

      assert(overlay).to.matchSnapshot('select-input__null_value_overlay.html');
    });
  });

  test('updateDomValue', () => {
    should('update the value when selected', () => {
      const element = _.tester.bootstrapElement(SELECT_INPUT);
      element.textContent = 'Label';
      element.options = [
        {text: 'Option 1', key: '1'},
        {text: 'Option 2', key: '2'},
        {text: 'Option 3', key: '3'},
      ];
      element.initValue = '2';
      element.clearFn(undefined);

      // Check the overlay.
      const harness = getHarness(element, SelectInputHarness);
      harness.simulateOpenOptions();
      const overlay = _.tester.bootstrapElement(OVERLAY);
      getHarness(overlay, OverlayHarness).getContent(SelectOptionHarness)!
          .simulateClickOption('Option 3');

      assert(element.value).to.equal('3');
      assert(overlay).to.matchSnapshot('select-input__clicked.html');
    });
  });
});