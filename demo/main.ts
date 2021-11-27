import {filterNonNullable} from 'gs-tools/export/rxjs';
import {combineLatest} from 'rxjs';
import {startWith, tap} from 'rxjs/operators';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {$themeLoader, start} from '../src/app/app';
import {registerSvg} from '../src-next/core/svg-service';
import {ClassThemeLoader} from '../src/theme/loader/class-theme-loader';
import {PALETTE, Palette} from '../src/theme/palette';
import {Theme} from '../src/theme/theme';

import chevronDownSvg from './asset/chevron_down.svg';
import chevronUpSvg from './asset/chevron_up.svg';
import highlightSvg from './asset/highlight.svg';
import maskSvg from './asset/mask.svg';
import paletteSvg from './asset/palette.svg';
import settingsSvg from './asset/settings.svg';
import {Demo} from './core/demo';
import {$demoState, ACCENT_COLOR_NAME, BASE_COLOR_NAME} from './core/demo-state';
import {$locationService} from './core/location-service';


const theme = new Theme(PALETTE[BASE_COLOR_NAME], PALETTE[ACCENT_COLOR_NAME]);

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
      [Demo],
      document,
      new ClassThemeLoader(theme),
  );

  for (const [key, content] of ICONS) {
    registerSvg(vine, key, {type: 'embed', content});
  }

  $locationService.get(vine).run().subscribe();

  const themeLoader$ = $themeLoader.get(vine);

  // Update the theme based on the demo state.
  combineLatest([
    $demoState.get(vine).$('baseColorName').pipe(
        filterNonNullable(),
        startWith<keyof Palette>(BASE_COLOR_NAME),
    ),
    $demoState.get(vine).$('accentColorName').pipe(
        filterNonNullable(),
        startWith<keyof Palette>(ACCENT_COLOR_NAME),
    ),
  ])
      .pipe(
          tap(([base, accent]) => {
            themeLoader$.next(new ClassThemeLoader(new Theme(
                PALETTE[base],
                PALETTE[accent],
            )));
          }),
      )
      .subscribe();
});

