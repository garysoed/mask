import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {HslColor} from 'gs-tools/export/color';

import render from './goldens/theme.txt';
import {Theme} from './theme';


test('@mask/theme/theme', () => {
  setup(() => {
    runEnvironment(new BrowserSnapshotsEnv({render}));
  });

  test('generateCss', () => {
    should('not throw', () => {
      const cssString = new Theme(
          new HslColor(45, 0.75, 0.5),
          new HslColor(60, 0.75, 0.5),
      ).generateCss();
      assert(cssString).to.matchSnapshot('render');
    });
  });
});
