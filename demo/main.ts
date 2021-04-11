import {filterNonNullable} from 'gs-tools/export/rxjs';
import {Snapshot, StateId, StateService} from 'gs-tools/export/state';
import {LocalStorage} from 'gs-tools/export/store';
import {identity, json} from 'nabu';
import {EMPTY, merge} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {CheckedValue} from '../src/action/input/checkbox';
import {$theme, start} from '../src/app/app';
import {$saveConfig, $saveService} from '../src/core/save-service';
import {$stateService} from '../src/core/state-service';
import {registerSvg} from '../src/core/svg-service';
import {PALETTE, Palette} from '../src/theme/palette';
import {Theme} from '../src/theme/theme';

import chevronDownSvg from './asset/chevron_down.svg';
import chevronUpSvg from './asset/chevron_up.svg';
import highlightSvg from './asset/highlight.svg';
import maskSvg from './asset/mask.svg';
import paletteSvg from './asset/palette.svg';
import settingsSvg from './asset/settings.svg';
import {Demo} from './core/demo';
import {$demoState, DemoState} from './core/demo-state';
import {$locationService} from './core/location-service';


const DEMO_STATE_KEY = 'demoState';
const BASE_COLOR_NAME = 'TEAL';
const ACCENT_COLOR_NAME = 'PURPLE';
const theme = new Theme(document, PALETTE[BASE_COLOR_NAME], PALETTE[ACCENT_COLOR_NAME]);

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
      theme,
      document.body,
  );

  for (const [key, content] of ICONS) {
    registerSvg(vine, key, {type: 'embed', content});
  }

  $locationService.get(vine).run().subscribe();

  const stateService = $stateService.get(vine);
  const theme$ = $theme.get(vine);

  // Update the theme based on the demo state.
  $demoState.get(vine)
      .pipe(
          switchMap(demoState => {
            if (!demoState) {
              return EMPTY;
            }

            const {$baseColorName, $accentColorName} = demoState;
            const onBaseColorName$ = stateService.resolve($baseColorName).pipe(
                filterNonNullable(),
                tap(colorName => {
                  theme$.next(theme$.getValue().setBaseColor(PALETTE[colorName]));
                }),
            );

            const onAccentColorName$ = stateService.resolve($accentColorName).pipe(
                filterNonNullable(),
                tap(colorName => {
                  theme$.next(theme$.getValue().setHighlightColor(PALETTE[colorName]));
                }),
            );
            return merge(onBaseColorName$, onAccentColorName$);
          }),
      )
      .subscribe();

  const saveService = $saveService.get(vine);
  saveService.setSaving(true);
  saveService.run().subscribe();

  $saveConfig.get(vine).next({
    loadOnInit: true,
    saveId: DEMO_STATE_KEY,
    initFn: init,
    storage: new LocalStorage<Snapshot<DemoState>, any>(
        window,
        'mkd',
        identity(),
        json(),
    ),
  });
});

function init(stateService: StateService): StateId<DemoState> {
  return stateService.modify(x => {
    return x.add<DemoState>({
      $accentColorName: x.add<keyof Palette>(ACCENT_COLOR_NAME),
      $baseColorName: x.add<keyof Palette>(BASE_COLOR_NAME),
      $isDarkMode: x.add<boolean>(true),
      checkboxDemo: {
        $unknownCheckboxState: x.add<CheckedValue>('unknown'),
        $disabledCheckboxState: x.add<CheckedValue>(true),
        $labelCheckboxState: x.add<CheckedValue>(false),
      },
      drawerLayoutDemo: {
        $isExpanded: x.add<CheckedValue>(false),
        $isHorizontalMode: x.add<CheckedValue>(true),
      },
      iconDemo: {
        $isAction: x.add<CheckedValue>(false),
        $fitToWidth: x.add<CheckedValue>(false),
      },
      numberInputDemo: {
        $disabledNumberInputState: x.add(123),
        $enabledNumberInputState: x.add(-10),
        $rangedNumberInputState: x.add(0),
        $steppedNumberInputState: x.add(2),
      },
      overlayLayoutDemo: {
        $targetHorizontalIndex: x.add(0),
        $targetVerticalIndex: x.add(0),
        $overlayHorizontalIndex: x.add(0),
        $overlayVerticalIndex: x.add(0),
      },
      radioInputDemo: {
        $selectedIndex: x.add<number|null>(null),
      },
      textInputDemo: {
        $disabledTextInputState: x.add<string>('Disabled text input value'),
        $enabledTextInputState: x.add<string>('Init value'),
        $emailTextInputState: x.add<string>('email@host.com'),
        $telTextInputState: x.add<string>('1 (845) 949 1234'),
        $urlTextInputState: x.add<string>('www.url.com'),
      },
    });
  });
}
