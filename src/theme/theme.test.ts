import { assert, should, test } from 'gs-testing';
import { HslColor } from 'gs-tools/export/color';

import { Theme } from './theme';

test('@mask/theme/theme', () => {
  test('inject', () => {
    should(`not throw`, () => {
      const containerEl = document.createElement('div');
      new Theme(
          document,
          HslColor.newInstance(45, 0.75, 0.5),
          HslColor.newInstance(60, 0.75, 0.5),
      ).injectCss(containerEl);
      assert(containerEl.children.item(0)?.innerHTML || '').to.match(/mk-theme/);
    });
  });
});
