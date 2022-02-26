import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {$themeLoader, start} from '../src/app/app';
import {registerSvg} from '../src/core/svg-service';
import {ThemeMode} from '../src/theme/const';
import {ClassThemeLoader} from '../src/theme/loader/class-theme-loader';
import {Theme} from '../src/theme/theme';
import {THEME_SEEDS} from '../src/theme/theme-seed';

import chevronDownSvg from './asset/chevron_down.svg';
import chevronUpSvg from './asset/chevron_up.svg';
import highlightSvg from './asset/highlight.svg';
import maskSvg from './asset/mask.svg';
import paletteSvg from './asset/palette.svg';
import settingsSvg from './asset/settings.svg';
import {DEMO} from './core/demo';
import {$theme$, ACCENT_COLOR_NAME, BASE_COLOR_NAME} from './core/demo-state';
import {$locationService} from './core/location-service';


const theme = new Theme({
  baseSeed: THEME_SEEDS[BASE_COLOR_NAME],
  accentSeed: THEME_SEEDS[ACCENT_COLOR_NAME],
  mode: ThemeMode.DARK,
});

const consoleDestination = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(entry => {
  consoleDestination.log(entry);
});

const ICONS = new Map([
  ['chevrondown', chevronDownSvg],
  ['chevronup', chevronUpSvg],
  ['logo', maskSvg],
  ['highlight', highlightSvg],
  ['palette', paletteSvg],
  ['settings', settingsSvg],
]);

window.addEventListener('load', () => {
  const {vine} = start(
      'demo',
      [DEMO],
      document,
      new ClassThemeLoader(theme),
  );

  for (const [key, content] of ICONS) {
    registerSvg(vine, key, {type: 'embed', content});
  }

  $locationService.get(vine).run().subscribe();

  const themeLoader$ = $themeLoader.get(vine);

  // Update the theme based on the demo state.
  $theme$.get(vine).subscribe(theme => {
    themeLoader$.next(new ClassThemeLoader(theme));
  });
});

