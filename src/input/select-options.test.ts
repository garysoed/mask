import {assert, createSpySubject, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getHarness} from 'persona/export/testing';

import {setupThemedTest} from '../testing/setup-themed-test';

import goldens from './goldens/goldens.json';
import {$selectOptionsSelected$, $selectOptionsSpecs$, SELECT_OPTIONS} from './select-options';
import {SelectOptionHarness} from './testing/select-options-harness';

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
      $selectOptionsSpecs$.get(_.tester.vine).next({
        options: [
          {text: 'Option A', key: '1'},
          {text: 'Option B', key: '2'},
          {text: 'Option C', key: '3'},
        ],
      });

      $selectOptionsSelected$.get(_.tester.vine).next('2');

      assert(element).to.matchSnapshot('select-options__render.html');
    });
  });

  test('select', () => {
    should('emit events on selected', () => {
      const element = _.tester.bootstrapElement(SELECT_OPTIONS);
      $selectOptionsSpecs$.get(_.tester.vine).next({
        options: [
          {text: 'Option A', key: '1'},
          {text: 'Option B', key: '2'},
          {text: 'Option C', key: '3'},
        ],
      });

      const harness = getHarness(element, SelectOptionHarness);
      harness.simulateClickOption('Option B');

      assert(element).to.matchSnapshot('select-options__select.html');
      assert($selectOptionsSelected$.get(_.tester.vine)).to.emitWith('2');
    });

    should('change the selection on multiple clicks', () => {
      const element = _.tester.bootstrapElement(SELECT_OPTIONS);
      $selectOptionsSpecs$.get(_.tester.vine).next({
        options: [
          {text: 'Option A', key: '1'},
          {text: 'Option B', key: '2'},
          {text: 'Option C', key: '3'},
        ],
      });

      const selected$ = createSpySubject($selectOptionsSelected$.get(_.tester.vine));

      const harness = getHarness(element, SelectOptionHarness);
      harness.simulateClickOption('Option B');
      harness.simulateClickOption('Option C');

      assert(selected$).to.emitSequence([null, '2', '3']);
    });
  });
});