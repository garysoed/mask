import { assert, should, test } from '@gs-testing/main';
import { HslColor } from '@gs-tools/color';
import { Theme } from './theme';

test('theme.Theme', () => {
  test('inject', () => {
    should(`not throw`, () => {
      const styleEl = document.createElement('style');
      new Theme(
          HslColor.newInstance(45, 0.75, 0.5),
          HslColor.newInstance(60, 0.75, 0.5)).injectCss(styleEl);
      assert(styleEl.innerHTML).to.match(/mk-theme/);
    });
  });
});
