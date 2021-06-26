import {$stateService, Source, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';

import {CheckedValue} from '../../src/action/input/checkbox';
import {Palette} from '../../src/theme/palette';


export interface CheckboxDemoState {
  readonly $unknownCheckboxState: StateId<CheckedValue>;
  readonly $disabledCheckboxState: StateId<CheckedValue>;
  readonly $labelCheckboxState: StateId<CheckedValue>;
}

export interface DrawerLayoutDemoState {
  readonly $isExpanded: StateId<CheckedValue>;
  readonly $isHorizontalMode: StateId<CheckedValue>;
}

export interface IconDemoState {
  readonly $isAction: StateId<CheckedValue>;
  readonly $fitToWidth: StateId<CheckedValue>;
}

export interface OverlayLayoutDemoState {
  readonly $targetHorizontalIndex: StateId<number|null>;
  readonly $targetVerticalIndex: StateId<number|null>;
  readonly $overlayHorizontalIndex: StateId<number|null>;
  readonly $overlayVerticalIndex: StateId<number|null>;
}

export interface RadioInputDemoState {
  readonly $selectedIndex: StateId<number|null>;
}

export interface TextInputDemoState {
  readonly $enabledTextInputState: StateId<string>;
  readonly $disabledTextInputState: StateId<string>;
  readonly $emailTextInputState: StateId<string>;
  readonly $telTextInputState: StateId<string>;
  readonly $urlTextInputState: StateId<string>;
}

export interface NumberInputDemoState {
  readonly $enabledNumberInputState: StateId<number>;
  readonly $disabledNumberInputState: StateId<number>;
  readonly $rangedNumberInputState: StateId<number>;
  readonly $steppedNumberInputState: StateId<number>;
}

export interface DemoState {
  readonly $accentColorName: StateId<keyof Palette>;
  readonly $baseColorName: StateId<keyof Palette>;
  readonly $isDarkMode: StateId<boolean>;
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

export const $demoStateId: Source<StateId<DemoState>|undefined> = source(
    'demoStateId',
    vine => $stateService.get(vine).modify(x => x.add({
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
    })),
);

export const $demoState = source(
    'demoState',
    vine => {
      return $stateService.get(vine).resolve($demoStateId.get(vine));
    },
);
