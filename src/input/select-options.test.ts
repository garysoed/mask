import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {getHarness} from 'persona/export/testing';

import {setupThemedTest} from '../testing/setup-themed-test';

import goldens from './goldens/goldens.json';
import {SELECT_OPTIONS} from './select-options';
import {SelectOptionHarness} from './testing/select-option-harness';

test('@mask/src/input/select-options', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/input/goldens', goldens));
    const tester = setupThemedTest({
      roots: [SELECT_OPTIONS],
    });
    return {tester};
  });

  test('render', () => {
    should('render the options correctly', () => {
      const element = _.tester.bootstrapElement(SELECT_OPTIONS);
      element.specs = {
        options: [
          {text: 'Option A', key: '1'},
          {text: 'Option B', key: '2'},
          {text: 'Option C', key: '3'},
        ],
      };

      element.setSelected('2');

      assert(snapshotElement(element)).to.match('select-options__render.golden');
    });
  });

  test('select', () => {
    should('emit events on selected', () => {
      const element = _.tester.bootstrapElement(SELECT_OPTIONS);
      element.specs = {
        options: [
          {text: 'Option A', key: '1'},
          {text: 'Option B', key: '2'},
          {text: 'Option C', key: '3'},
        ],
      };

      const harness = getHarness(element, SelectOptionHarness);
      harness.simulateClickOption('Option B');

      assert(snapshotElement(element)).to.match('select-options__select.golden');
      assert(element.selected).to.equal('2');
    });

    should('change the selection on multiple clicks', () => {
      const element = _.tester.bootstrapElement(SELECT_OPTIONS);
      element.specs = {
        options: [
          {text: 'Option A', key: '1'},
          {text: 'Option B', key: '2'},
          {text: 'Option C', key: '3'},
        ],
      };

      const harness = getHarness(element, SelectOptionHarness);
      assert(element.selected).to.beNull();
      harness.simulateClickOption('Option B');
      assert(element.selected).to.equal('2');
      harness.simulateClickOption('Option C');
      assert(element.selected).to.equal('3');
    });
  });
});