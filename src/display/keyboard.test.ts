import { BrowserSnapshotsEnv } from 'gs-testing/export/browser';
import { PersonaTesterFactory } from 'persona/export/testing';
import { assert, runEnvironment, should, test } from 'gs-testing';

import { _p } from '../app/app';

import * as snapshots from './snapshots.json';
import { $, $keyboard, Keyboard } from './keyboard';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@mask/display/keyboard', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv(snapshots));
    const tester = TESTER_FACTORY.build([Keyboard], document);
    const el = tester.createElement($keyboard.tag);

    return {tester, el};
  });

  test('render', () => {
    should('render the nodes correctly', () => {
      _.el.setText($.host, 'meta alt enter 3');

      assert(_.el.element.shadowRoot!.innerHTML).to.matchSnapshot('keyboard.render');
    });
  });
});
