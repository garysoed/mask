import {Source, source} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {Anchor} from '../../src/core/overlay-service';
import {CheckedValue} from '../../src/input/checkbox';
import {ThemeMode} from '../../src/theme/const';
import {Theme} from '../../src/theme/theme';
import {ThemeSeed, THEME_SEEDS} from '../../src/theme/theme-seed';


export interface CheckboxDemoState {
  readonly unknownCheckboxState: Subject<CheckedValue>;
  readonly disabledCheckboxState: Subject<CheckedValue>;
  readonly labelCheckboxState: Subject<CheckedValue>;
}

export interface DrawerLayoutDemoState {
  readonly isExpanded: Subject<CheckedValue>;
  readonly isHorizontalMode: Subject<CheckedValue>;
}

export interface IconDemoState {
  readonly isAction: Subject<CheckedValue>;
  readonly fitToWidth: Subject<CheckedValue>;
}

export interface OverlayLayoutDemoState {
  readonly targetHorizontalIndex: Subject<string|null>;
  readonly targetVerticalIndex: Subject<string|null>;
  readonly overlayHorizontalIndex: Subject<string|null>;
  readonly overlayVerticalIndex: Subject<string|null>;
}

export interface RadioInputDemoState {
  readonly selectedKey: Subject<string|null>;
}

export interface SelectInputDemoState {
  readonly enabledSelectInputState: Subject<string|null>;
  readonly disabledSelectInputState: Subject<string|null>;
}

export interface TextInputDemoState {
  readonly enabledTextInputState: Subject<string>;
  readonly disabledTextInputState: Subject<string>;
  readonly emailTextInputState: Subject<string>;
  readonly telTextInputState: Subject<string>;
  readonly urlTextInputState: Subject<string>;
}

export interface NumberInputDemoState {
  readonly enabledNumberInputState: Subject<number|null>;
  readonly disabledNumberInputState: Subject<number|null>;
  readonly rangedNumberInputState: Subject<number|null>;
  readonly steppedNumberInputState: Subject<number|null>;
}

export interface DemoState {
  readonly accentColorName: Subject<keyof ThemeSeed>;
  readonly baseColorName: Subject<keyof ThemeSeed>;
  readonly isDarkMode: Subject<CheckedValue>;
  readonly checkboxDemo: CheckboxDemoState;
  readonly drawerLayoutDemo: DrawerLayoutDemoState;
  readonly iconDemo: IconDemoState;
  readonly numberInputDemo: NumberInputDemoState;
  readonly overlayLayoutDemo: OverlayLayoutDemoState;
  readonly radioInputDemo: RadioInputDemoState;
  readonly selectInputDemo: SelectInputDemoState;
  readonly textInputDemo: TextInputDemoState;
}

export const BASE_COLOR_NAME: keyof ThemeSeed = 'TEAL';
export const ACCENT_COLOR_NAME: keyof ThemeSeed = 'PURPLE';

export const $demoState: Source<DemoState> = source(
    () => ({
      accentColorName: new BehaviorSubject<keyof ThemeSeed>(ACCENT_COLOR_NAME),
      baseColorName: new BehaviorSubject<keyof ThemeSeed>(BASE_COLOR_NAME),
      isDarkMode: new BehaviorSubject<CheckedValue>(true),
      checkboxDemo: {
        unknownCheckboxState: new BehaviorSubject<CheckedValue>(null),
        disabledCheckboxState: new BehaviorSubject<CheckedValue>(true),
        labelCheckboxState: new BehaviorSubject<CheckedValue>(false),
      },
      drawerLayoutDemo: {
        isExpanded: new BehaviorSubject<CheckedValue>(false),
        isHorizontalMode: new BehaviorSubject<CheckedValue>(true),
      },
      iconDemo: {
        isAction: new BehaviorSubject<CheckedValue>(false),
        fitToWidth: new BehaviorSubject<CheckedValue>(false),
      },
      numberInputDemo: {
        disabledNumberInputState: new BehaviorSubject<number|null>(123),
        enabledNumberInputState: new BehaviorSubject<number|null>(-10),
        rangedNumberInputState: new BehaviorSubject<number|null>(0),
        steppedNumberInputState: new BehaviorSubject<number|null>(2),
      },
      overlayLayoutDemo: {
        targetHorizontalIndex: new BehaviorSubject<string|null>(Anchor.START),
        targetVerticalIndex: new BehaviorSubject<string|null>(Anchor.START),
        overlayHorizontalIndex: new BehaviorSubject<string|null>(Anchor.START),
        overlayVerticalIndex: new BehaviorSubject<string|null>(Anchor.START),
      },
      radioInputDemo: {
        selectedKey: new BehaviorSubject<string|null>(null),
      },
      selectInputDemo: {
        enabledSelectInputState: new BehaviorSubject<string|null>(null),
        disabledSelectInputState: new BehaviorSubject<string|null>('1'),
      },
      textInputDemo: {
        disabledTextInputState: new BehaviorSubject('Disabled text input value'),
        enabledTextInputState: new BehaviorSubject('Init value'),
        emailTextInputState: new BehaviorSubject('email@host.com'),
        telTextInputState: new BehaviorSubject('1 (845) 949 1234'),
        urlTextInputState: new BehaviorSubject('www.url.com'),
      },
    }),
);

export const $theme$ = source(vine => {
  return combineLatest([
    $demoState.get(vine).baseColorName.pipe(
        filterNonNullable(),
        startWith<keyof ThemeSeed>(BASE_COLOR_NAME),
    ),
    $demoState.get(vine).accentColorName.pipe(
        filterNonNullable(),
        startWith<keyof ThemeSeed>(ACCENT_COLOR_NAME),
    ),
    $demoState.get(vine).isDarkMode.pipe(
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