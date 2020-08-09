import { assert, should, test } from 'gs-testing';
import { HslColor } from 'gs-tools/export/color';

import { Theme } from './theme';


test('@mask/theme/theme', () => {
  test('inject', () => {
    should(`not throw`, () => {
      const styleEl = new Theme(
          document,
          new HslColor(45, 0.75, 0.5),
          new HslColor(60, 0.75, 0.5),
      ).getStyleEl();
      assert(styleEl.innerHTML).to.match(/mk-theme/);
    });
  });
});
