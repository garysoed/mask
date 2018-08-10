import { should } from 'gs-testing/export/main';
import { HslColor } from 'gs-tools/export/color';
import { Theme } from './theme';

describe('theme.Theme', () => {
  describe('inject', () => {
    should(`work`, () => {
      new Theme(
          HslColor.newInstance(45, 0.75, 0.5),
          HslColor.newInstance(60, 0.75, 0.5)).injectCss(document);
    });
  });
});
