import { filterNonNull } from 'gs-tools/export/rxjs';
import { Snapshot, StateId, StateService } from 'gs-tools/export/state';
import { combineLatest, EMPTY, merge } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { CheckedValue } from '../export';
import { $theme, start } from '../src/app/app';
import { $stateService } from '../src/core/state-service';
import { registerSvg } from '../src/core/svg-service';
import { PALETTE, Palette } from '../src/theme/palette';
import { Theme } from '../src/theme/theme';

import chevronDownSvg from './asset/chevron_down.svg';
import chevronUpSvg from './asset/chevron_up.svg';
import highlightSvg from './asset/highlight.svg';
import maskSvg from './asset/mask.svg';
import paletteSvg from './asset/palette.svg';
import settingsSvg from './asset/settings.svg';
import { Demo } from './core/demo';
import { $demoState, $demoStateId, CheckboxDemoState, DemoState } from './core/demo-state';
import { $locationService } from './core/location-service';


const DEMO_STATE_KEY = 'mkd.demoState';
const BASE_COLOR_NAME = 'TEAL';
const ACCENT_COLOR_NAME = 'PURPLE';
const theme = new Theme(document, PALETTE[BASE_COLOR_NAME], PALETTE[ACCENT_COLOR_NAME]);

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
      theme,
      document.body,
  );

  for (const [key, content] of ICONS) {
    registerSvg(vine, key, {type: 'embed', content});
  }

  $locationService.get(vine)
      .pipe(switchMap(locationService => locationService.run()))
      .subscribe();

  // Update the theme based on the demo state.
  combineLatest([
    $demoState.get(vine),
    $stateService.get(vine),
  ])
  .pipe(
      switchMap(([demoState, stateService]) => {
        if (!demoState) {
          return EMPTY;
        }

        const {$baseColorName, $accentColorName} = demoState;
        const onBaseColorName$ = stateService.get($baseColorName).pipe(
            filterNonNull(),
            tap(colorName => {
              $theme.set(vine, theme => theme.setBaseColor(PALETTE[colorName]));
            }),
        );

        const onAccentColorName$ = stateService.get($accentColorName).pipe(
            filterNonNull(),
            tap(colorName => {
              $theme.set(vine, theme => theme.setHighlightColor(PALETTE[colorName]));
            }),
        );
        return merge(onBaseColorName$, onAccentColorName$);
      }),
  )
  .subscribe();

  // Initialize the state service.
  $stateService.get(vine)
      .pipe(take(1))
      .subscribe(stateService => {
        const rootStateId = initFromLocalStorage(stateService) || init(stateService);
        $demoStateId.set(vine, () => rootStateId);
      });
});

function initFromLocalStorage(stateService: StateService): StateId<DemoState>|null {
  const stateStr = localStorage.getItem(DEMO_STATE_KEY);
  if (!stateStr) {
    return null;
  }

  try {
    return stateService.init(JSON.parse(stateStr) as Snapshot<DemoState>);
  } catch (e) {
    return null;
  }
}

function init(stateService: StateService): StateId<DemoState> {
  const $unknownCheckboxState = stateService.add<CheckedValue>('unknown');
  const $disabledCheckboxState = stateService.add<CheckedValue>(true);
  const $miscCheckboxState = stateService.add<CheckedValue>(false);

  const $disabledTextInputState = stateService.add<string>('Disabled text input value');
  const $enabledTextInputState = stateService.add<string>('Init value');
  const $emailTextInputState = stateService.add<string>('email@host.com');
  const $telTextInputState = stateService.add<string>('1 (845) 949 1234');
  const $urlTextInputState = stateService.add<string>('www.url.com');

  const $accentColorName = stateService.add<keyof Palette>(ACCENT_COLOR_NAME);
  const $baseColorName = stateService.add<keyof Palette>(BASE_COLOR_NAME);
  const $isDarkMode = stateService.add<boolean>(true);
  return stateService.add<DemoState>({
    $accentColorName,
    $baseColorName,
    $isDarkMode,
    checkboxDemo: {
      $unknownCheckboxState,
      $disabledCheckboxState,
      $labelCheckboxState: $miscCheckboxState,
    },
    textInputDemo: {
      $disabledTextInputState,
      $enabledTextInputState,
      $emailTextInputState,
      $telTextInputState,
      $urlTextInputState,
    },
  });
}
