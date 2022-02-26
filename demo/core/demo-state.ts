import {$stateService, Source, source} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {ImmutableResolver, mutableState, MutableState} from 'gs-tools/export/state';
import {combineLatest} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {Anchor} from '../../src/core/overlay-service';
import {CheckedValue} from '../../src/input/checkbox';
import {ThemeMode} from '../../src/theme/const';
import {Theme} from '../../src/theme/theme';
import {ThemeSeed, THEME_SEEDS} from '../../src/theme/theme-seed';


export interface CheckboxDemoState {
  readonly unknownCheckboxState: MutableState<CheckedValue>;
  readonly disabledCheckboxState: MutableState<CheckedValue>;
  readonly labelCheckboxState: MutableState<CheckedValue>;
}

export interface DrawerLayoutDemoState {
  readonly isExpanded: MutableState<CheckedValue>;
  readonly isHorizontalMode: MutableState<CheckedValue>;
}

export interface IconDemoState {
  readonly isAction: MutableState<CheckedValue>;
  readonly fitToWidth: MutableState<CheckedValue>;
}

export interface OverlayLayoutDemoState {
  readonly targetHorizontalIndex: MutableState<string|null>;
  readonly targetVerticalIndex: MutableState<string|null>;
  readonly overlayHorizontalIndex: MutableState<string|null>;
  readonly overlayVerticalIndex: MutableState<string|null>;
}

export interface RadioInputDemoState {
  readonly selectedKey: MutableState<string|null>;
}

export interface TextInputDemoState {
  readonly enabledTextInputState: MutableState<string>;
  readonly disabledTextInputState: MutableState<string>;
  readonly emailTextInputState: MutableState<string>;
  readonly telTextInputState: MutableState<string>;
  readonly urlTextInputState: MutableState<string>;
}

export interface NumberInputDemoState {
  readonly enabledNumberInputState: MutableState<number|null>;
  readonly disabledNumberInputState: MutableState<number|null>;
  readonly rangedNumberInputState: MutableState<number|null>;
  readonly steppedNumberInputState: MutableState<number|null>;
}

export interface DemoState {
  readonly accentColorName: MutableState<keyof ThemeSeed>;
  readonly baseColorName: MutableState<keyof ThemeSeed>;
  readonly isDarkMode: MutableState<boolean>;
  readonly checkboxDemo: CheckboxDemoState;
  readonly drawerLayoutDemo: DrawerLayoutDemoState;
  readonly iconDemo: IconDemoState;
  readonly numberInputDemo: NumberInputDemoState;
  readonly overlayLayoutDemo: OverlayLayoutDemoState;
  readonly radioInputDemo: RadioInputDemoState;
  readonly textInputDemo: TextInputDemoState;
}

export const BASE_COLOR_NAME: keyof ThemeSeed = 'TEAL';
export const ACCENT_COLOR_NAME: keyof ThemeSeed = 'PURPLE';

export const $demoState: Source<ImmutableResolver<DemoState>> = source(
    vine => $stateService.get(vine).addRoot({
      accentColorName: mutableState(ACCENT_COLOR_NAME),
      baseColorName: mutableState(BASE_COLOR_NAME),
      isDarkMode: mutableState(true),
      checkboxDemo: {
        unknownCheckboxState: mutableState(null),
        disabledCheckboxState: mutableState(true),
        labelCheckboxState: mutableState(false),
      },
      drawerLayoutDemo: {
        isExpanded: mutableState(false),
        isHorizontalMode: mutableState(true),
      },
      iconDemo: {
        isAction: mutableState(false),
        fitToWidth: mutableState(false),
      },
      numberInputDemo: {
        disabledNumberInputState: mutableState(123),
        enabledNumberInputState: mutableState(-10),
        rangedNumberInputState: mutableState(0),
        steppedNumberInputState: mutableState(2),
      },
      overlayLayoutDemo: {
        targetHorizontalIndex: mutableState(Anchor.START),
        targetVerticalIndex: mutableState(Anchor.START),
        overlayHorizontalIndex: mutableState(Anchor.START),
        overlayVerticalIndex: mutableState(Anchor.START),
      },
      radioInputDemo: {
        selectedKey: mutableState(null),
      },
      textInputDemo: {
        disabledTextInputState: mutableState('Disabled text input value'),
        enabledTextInputState: mutableState('Init value'),
        emailTextInputState: mutableState('email@host.com'),
        telTextInputState: mutableState('1 (845) 949 1234'),
        urlTextInputState: mutableState('www.url.com'),
      },
    })._(),
);

export const $theme$ = source(vine => {
  return combineLatest([
    $demoState.get(vine).$('baseColorName').pipe(
        filterNonNullable(),
        startWith<keyof ThemeSeed>(BASE_COLOR_NAME),
    ),
    $demoState.get(vine).$('accentColorName').pipe(
        filterNonNullable(),
        startWith<keyof ThemeSeed>(ACCENT_COLOR_NAME),
    ),
    $demoState.get(vine).$('isDarkMode').pipe(
        filterNonNullable(),
        startWith(false),
    ),
  ])
      .pipe(map(([base, accent, isDarkMode]) => {
        return new Theme({
          baseSeed: THEME_SEEDS[base],
          accentSeed: THEME_SEEDS[accent],
          mode: isDarkMode ? ThemeMode.DARK : ThemeMode.LIGHT,
        });
      }));
});