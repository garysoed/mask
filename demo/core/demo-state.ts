import { stream, Stream } from 'grapevine';
import { debug } from 'gs-tools/export/rxjs';
import { StateId } from 'gs-tools/export/state';
import { combineLatest, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Logger } from 'santa';

import { CheckedValue } from '../../src/action/input/checkbox';
import { $rootId } from '../../src/core/save-service';
import { $stateService } from '../../src/core/state-service';
import { Palette } from '../../src/theme/palette';


const LOGGER = new Logger('mkd.demo');


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
  readonly drawerLayoutDemo: DrawerLayoutDemoState;
  readonly iconDemo: IconDemoState;
  readonly radioInputDemo: RadioInputDemoState;
  readonly textInputDemo: TextInputDemoState;
}

export const $demoStateId: Stream<StateId<DemoState>|null, typeof globalThis> = stream(
    'demoStateId',
    vine => $rootId.get(vine).pipe(debug(LOGGER, 'demoStateId')),
    globalThis,
);

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
