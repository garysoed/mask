import { cache } from 'gs-tools/export/data';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { StateId } from 'gs-tools/export/state';
import { instanceofType } from 'gs-types';
import { element, PersonaContext, setAttribute } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { $checkbox, $icon, $stateService, _p, CheckedValue, Icon as MaskIcon, registerSvg, ThemedCustomElementCtrl } from '../../export';
import { FitTo } from '../../src/display/icon';
import fitToHeightSvg from '../asset/fit_to_height.svg';
import { DemoLayout } from '../base/demo-layout';
import { $demoState, IconDemoState } from '../core/demo-state';

import template from './icon.html';


export const $iconDemo = {
  tag: 'mkd-icon',
  api: {},
};

const $ = {
  fitToWidthCheckbox: element('fitToWidthCheckbox', $checkbox, {}),
  icon: element('icon', $icon, {}),
  iconContainer: element('iconContainer', instanceofType(HTMLDivElement), {
    action: setAttribute('mk-action-2'),
  }),
  isActionCheckbox: element('isActionCheckbox', $checkbox, {}),
};

@_p.customElement({
  ...$iconDemo,
  dependencies: [
    DemoLayout,
    MaskIcon,
  ],
  template,
  configure: vine => {
    registerSvg(vine, 'fit_to_height', {type: 'embed', content: fitToHeightSvg});
  },
})
export class IconDemo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.iconContainer._.action, this.isAction$);
    this.render($.icon._.fitTo, this.fitTo$);
    this.render($.fitToWidthCheckbox._.stateId, this.$fitToWidth$);
    this.render($.isActionCheckbox._.stateId, this.$isAction$);
  }

  @cache()
  private get $fitToWidth$(): Observable<StateId<CheckedValue>> {
    return this.iconDemoState$.pipe(
        map(demoState => demoState?.$fitToWidth ?? null),
        filterNonNull(),
    );
  }

  @cache()
  private get $isAction$(): Observable<StateId<CheckedValue>> {
    return this.iconDemoState$.pipe(
        map(demoState => demoState?.$isAction ?? null),
        filterNonNull(),
    );
  }

  @cache()
  private get iconDemoState$(): Observable<IconDemoState|null> {
    return $demoState.get(this.vine).pipe(map(demoState => demoState?.iconDemo ?? null));
  }

  @cache()
  private get isAction$(): Observable<boolean> {
    return this.iconDemoState$.pipe(
        withLatestFrom($stateService.get(this.vine)),
        switchMap(([demoState, stateService]) => {
          if (!demoState) {
            return observableOf(null);
          }

          return stateService.get(demoState.$isAction);
        }),
        map(isAction => !!isAction && isAction !== 'unknown'),
    );
  }

  @cache()
  private get fitTo$(): Observable<FitTo> {
    return this.iconDemoState$.pipe(
        withLatestFrom($stateService.get(this.vine)),
        switchMap(([demoState, stateService]) => {
          if (!demoState) {
            return observableOf(null);
          }

          return stateService.get(demoState.$fitToWidth);
        }),
        map(fitToWidth => {
          if (!fitToWidth) {
            return FitTo.HEIGHT;
          }

          return FitTo.WIDTH;
        }),
    );
  }
}
