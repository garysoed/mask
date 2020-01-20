import { $svgConfig, Palette, start as startMask, Theme } from '../export';

import maskSvg from './asset/mask.svg';
import { Demo } from './core/demo';


const theme = new Theme(Palette.TEAL, Palette.PURPLE);

const ICONS = new Map([
  ['logo', maskSvg],
]);

window.addEventListener('load', () => {
  const {vine} = startMask(
      'demo',
      [
        Demo,
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement,
  );

  const svgConfig$ = $svgConfig.get(vine);
  for (const [key, content] of ICONS) {
    svgConfig$.next({key, type: 'set', value: {type: 'embed', content}});
  }
});
