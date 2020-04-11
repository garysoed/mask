import { switchMap } from 'rxjs/operators';

import { $svgConfig, Palette, start as startMask, Theme } from '../export';

import chevronDownSvg from './asset/chevron_down.svg';
import chevronUpSvg from './asset/chevron_up.svg';
import highlightSvg from './asset/highlight.svg';
import maskSvg from './asset/mask.svg';
import paletteSvg from './asset/palette.svg';
import settingsSvg from './asset/settings.svg';
import { Demo } from './core/demo';
import { $locationService } from './core/location-service';


const theme = new Theme(Palette.TEAL, Palette.PURPLE);

const ICONS = new Map([
  ['chevrondown', chevronDownSvg],
  ['chevronup', chevronUpSvg],
  ['logo', maskSvg],
  ['highlight', highlightSvg],
  ['palette', paletteSvg],
  ['settings', settingsSvg],
]);

window.addEventListener('load', () => {
  const {vine} = startMask(
      'demo',
      [Demo],
      document,
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement,
  );

  const svgConfig$ = $svgConfig.get(vine);
  for (const [key, content] of ICONS) {
    svgConfig$.next({key, type: 'set', value: {type: 'embed', content}});
  }

  $locationService.get(vine)
      .pipe(switchMap(locationService => locationService.run()))
      .subscribe();
});
