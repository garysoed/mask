import { source, stream } from 'grapevine';
import { StateId } from 'gs-tools/export/state';
import { combineLatest, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { $stateService } from '../../src/core/state-service';
import { Palette } from '../../src/theme/palette';

export interface DemoState {
  readonly $baseColorName: StateId<keyof Palette>;
  readonly $accentColorName: StateId<keyof Palette>;
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
