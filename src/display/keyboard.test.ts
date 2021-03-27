import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../app/app';

import render from './goldens/keyboard.html';
import {$, Keyboard} from './keyboard';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@mask/display/keyboard', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({render}));
    const tester = TESTER_FACTORY.build({rootCtrls: [Keyboard], rootDoc: document});
    const el = tester.createElement(Keyboard);

    return {tester, el};
  });

  test('render', () => {
    should('render the nodes correctly', () => {
      _.el.setText($.host, 'meta alt enter 3');

      assert(_.el.flattenContent()).to.matchSnapshot('render');
    });
  });
});
