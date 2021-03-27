import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {HslColor} from 'gs-tools/export/color';

import render from './goldens/theme.html';
import {Theme} from './theme';


test('@mask/theme/theme', () => {
  setup(() => {
    runEnvironment(new BrowserSnapshotsEnv({render}));
  });

  test('inject', () => {
    should('not throw', () => {
      const styleEl = new Theme(
          document,
          new HslColor(45, 0.75, 0.5),
          new HslColor(60, 0.75, 0.5),
      ).getStyleEl();
      assert(styleEl).to.matchSnapshot('render');
    });
  });
});
