import {$stateService, Source, source} from 'grapevine';
import {mutableState, MutableState, RootStateId} from 'gs-tools/export/state';

import {Anchor} from '../../src-next/core/overlay-service';
import {CheckedValue} from '../../src-next/input/checkbox';
import {Palette} from '../../src-next/theme/palette';


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
  readonly accentColorName: MutableState<keyof Palette>;
  readonly baseColorName: MutableState<keyof Palette>;
  readonly isDarkMode: MutableState<boolean>;
  readonly checkboxDemo: CheckboxDemoState;
  readonly drawerLayoutDemo: DrawerLayoutDemoState;
  readonly iconDemo: IconDemoState;
  readonly numberInputDemo: NumberInputDemoState;
  readonly overlayLayoutDemo: OverlayLayoutDemoState;
  readonly radioInputDemo: RadioInputDemoState;
  readonly textInputDemo: TextInputDemoState;
}

export const BASE_COLOR_NAME = 'TEAL';
export const ACCENT_COLOR_NAME = 'PURPLE';

export const $demoStateId: Source<RootStateId<DemoState>> = source(
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
    }),
);

export const $demoState = source(vine => $stateService.get(vine)._($demoStateId.get(vine)));
