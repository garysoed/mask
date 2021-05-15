import {$stateService} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {$table, classToggle, element, PersonaContext} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {_p} from '../../src/app/app';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './colors.html';


export const $colorsDemo = {
  tag: 'mkd-colors',
  api: {},
};

const $ = {
  table: element('table', $table, {
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
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.table.darkClass(
          $demoState.get(this.vine)
              .pipe(
                  switchMap(demoState => {
                    if (!demoState) {
                      return observableOf(undefined);
                    }

                    return $stateService.get(this.vine).resolve(demoState.$isDarkMode);
                  }),
                  map(isDark => !!isDark),
              )),
    ];
  }
}
