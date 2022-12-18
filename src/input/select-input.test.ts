import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {getHarness} from 'persona/export/testing';

import {OVERLAY} from '../core/overlay';
import {setupThemedTest} from '../testing/setup-themed-test';

import goldens from './goldens/goldens.json';
import {SELECT_INPUT} from './select-input';
import {SelectInputHarness} from './testing/select-input-harness';

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
      const div = document.createElement('div');
      div.style.width = '800px';
      _.tester.addToBody(div);

      const element = _.tester.bootstrapElement(SELECT_INPUT);
      element.textContent = 'Label';
      element.options = [
        {text: 'Option 1', key: '1'},
        {text: 'Option 2', key: '2'},
        {text: 'Option 3', key: '3'},
      ];
      div.appendChild(element);
      element.value.next('2');

      assert(snapshotElement(element)).to.match('select-input__init_value.golden');

      // Check the overlay.
      const harness = getHarness(element, SelectInputHarness);
      harness.simulateOpenOptions();
      const overlay = _.tester.bootstrapElement(OVERLAY);

      assert(snapshotElement(overlay)).to.match('select-input__init_value_overlay.golden');
    });

    should('render null value correctly', () => {
      const div = document.createElement('div');
      div.style.width = '800px';
      _.tester.addToBody(div);
      const element = _.tester.bootstrapElement(SELECT_INPUT);
      element.textContent = 'Label';
      element.options = [
        {text: 'Option 1', key: '1'},
        {text: 'Option 2', key: '2'},
        {text: 'Option 3', key: '3'},
      ];
      div.appendChild(element);
      element.value.next(null);

      assert(snapshotElement(element)).to.match('select-input__null_value.golden');

      // Check the overlay.
      const harness = getHarness(element, SelectInputHarness);
      harness.simulateOpenOptions();
      const overlay = _.tester.bootstrapElement(OVERLAY);

      assert(snapshotElement(overlay)).to.match('select-input__null_value_overlay.golden');
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
      element.value.next('2');

      const overlay = _.tester.bootstrapElement(OVERLAY);
      // Check the overlay.
      const harness = getHarness(element, SelectInputHarness);
      harness.simulateSelectOption('Option 3', overlay);

      assert(element.value).to.emitWith('3');
      assert(snapshotElement(overlay)).to.match('select-input__clicked.golden');
    });
  });
});