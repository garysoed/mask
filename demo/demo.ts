import { HslColor } from 'gs-tools/export/color';
import { Theme } from '../src/theme/theme';

const theme = new Theme(HslColor.newInstance(45, 0.75, 0.5), HslColor.newInstance(90, 0.75, 0.5));
window.addEventListener('load', () => {
  theme.injectCss(document);
});
