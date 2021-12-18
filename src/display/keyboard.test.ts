import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {Keyboard} from './keyboard';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@mask/display/keyboard', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/display/goldens', goldens));
    const tester = TESTER_FACTORY.build({
      rootCtrls: [Keyboard],
      rootDoc: document,
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    const {element, harness} = tester.createHarness(Keyboard);

    return {element, harness, tester};
  });

  test('render', () => {
    should('render the nodes correctly', () => {
      _.harness.host._.text('meta alt enter 3');

      assert(_.element).to.matchSnapshot('keyboard');
    });
  });
});
