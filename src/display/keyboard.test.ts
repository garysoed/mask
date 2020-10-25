import { assert, run, runEnvironment, should, test } from 'gs-testing';
import { BrowserSnapshotsEnv } from 'gs-testing/export/browser';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';

import { $, $keyboard, Keyboard } from './keyboard';
import * as snapshots from './snapshots.json';

const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@mask/display/keyboard', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv(snapshots));
    const tester = TESTER_FACTORY.build([Keyboard], document);
    const el = tester.createElement($keyboard.tag);

    return {tester, el};
  });

  test('render', () => {
    should(`render the nodes correctly`, () => {
      run(_.el.setText($.host, 'meta alt enter 3'));

      assert(_.el.element.shadowRoot!.innerHTML).to.matchSnapshot('keyboard.render');
    });
  });
});
