import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {triggerFakeMutation} from 'persona/src/testing/fake-mutation-observer';

import {setupThemedTest} from '../testing/setup-themed-test';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {KEYBOARD} from './keyboard';


test('@mask/src/display/keyboard', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/display/goldens', goldens));
    const tester = setupThemedTest({
      roots: [KEYBOARD],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    return {tester};
  });

  test('render', () => {
    should('render the nodes correctly', () => {
      const element = _.tester.bootstrapElement(KEYBOARD);
      element.setAttribute('text', 'meta alt enter 3');
      triggerFakeMutation(element, {});

      assert(element).to.matchSnapshot('keyboard.html');
    });
  });
});
