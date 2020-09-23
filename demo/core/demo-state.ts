import { source, stream } from 'grapevine';
import { StateId } from 'gs-tools/export/state';
import { combineLatest, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { CheckedValue } from '../../src/action/input/checkbox';
import { $stateService } from '../../src/core/state-service';
import { Palette } from '../../src/theme/palette';

export interface CheckboxDemoState {
  readonly $unknownCheckboxState: StateId<CheckedValue>;
  readonly $disabledCheckboxState: StateId<CheckedValue>;
  readonly $labelCheckboxState: StateId<CheckedValue>;
}

export interface IconDemoState {
  readonly $isAction: StateId<CheckedValue>;
  readonly $fitToWidth: StateId<CheckedValue>;
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

export interface DemoState {
  readonly $accentColorName: StateId<keyof Palette>;
  readonly $baseColorName: StateId<keyof Palette>;
  readonly $isDarkMode: StateId<boolean>;
  readonly checkboxDemo: CheckboxDemoState;
  readonly iconDemo: IconDemoState;
  readonly radioInputDemo: RadioInputDemoState;
  readonly textInputDemo: TextInputDemoState;
}

export const $demoStateId = source<StateId<DemoState>|null>('demoStateId', () => null);

export const $demoState = stream(
    'demoState',
    vine => {
      return combineLatest([
        $stateService.get(vine),
        $demoStateId.get(vine),
      ])
      .pipe(
          switchMap(([stateService, demoStateId]) => {
            if (!demoStateId) {
              return observableOf(null);
            }

            return stateService.get(demoStateId);
          }),
      );
    },
    globalThis,
);
