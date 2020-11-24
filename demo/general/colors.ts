import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {classToggle, element, PersonaContext, ValuesOf} from 'persona';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {_p} from '../../src/app/app';
import {$stateService} from '../../src/core/state-service';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './colors.html';


export const $colorsDemo = {
  tag: 'mkd-colors',
  api: {},
};

const $ = {
  table: element('table', instanceofType(HTMLTableElement), {
    darkClass: classToggle('dark'),
  }),
};

@_p.customElement({
  ...$colorsDemo,
  dependencies: [
    DemoLayout,
  ],
  template,
})
export class ColorsDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get values(): ValuesOf<typeof $> {
    return {
      table: {
        darkClass: combineLatest([
          $demoState.get(this.vine),
          $stateService.get(this.vine),
        ])
            .pipe(
                switchMap(([demoState, stateService]) => {
                  if (!demoState) {
                    return observableOf(null);
                  }

                  return stateService.get(demoState.$isDarkMode);
                }),
                map(isDark => !!isDark),
            ),
      },
    };
  }
}
