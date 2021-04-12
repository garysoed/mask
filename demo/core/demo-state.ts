import {$stateService, Source, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {CheckedValue} from '../../src/action/input/checkbox';
import {$rootId$} from '../../src/core/save-service';
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

export const $demoStateId: Source<Observable<StateId<DemoState>|undefined>> = source(
    'demoStateId',
    vine => $rootId$.get(vine),
);

export const $demoState = source(
    'demoState',
    vine => {
      return $demoStateId.get(vine)
          .pipe(
              switchMap(demoStateId => {
                if (!demoStateId) {
                  return of(undefined);
                }

                return $stateService.get(vine).resolve(demoStateId);
              }),
          );
    },
);
