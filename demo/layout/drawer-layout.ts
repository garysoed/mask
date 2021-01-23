import {cache} from 'gs-tools/export/data';
import {filterDefined} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {elementWithTagType} from 'gs-types';
import {attributeOut, element, PersonaContext, stringParser} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$checkbox, Checkbox, CheckedValue} from '../../src/action/input/checkbox';
import {_p} from '../../src/app/app';
import {$stateService} from '../../src/core/state-service';
import {$drawerLayout, DrawerLayout, DrawerMode} from '../../src/layout/drawer-layout';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './drawer-layout.html';


const $ = {
  drawer: element('drawer', $drawerLayout, {}),
  expandCheckbox: element('expandCheckbox', $checkbox, {}),
  rootPlay: element('rootPlay', elementWithTagType('section'), {
    layout: attributeOut('layout', stringParser()),
  }),
  horizontalModeCheckbox: element('horizontalModeCheckbox', $checkbox, {}),
};

export const $drawerLayoutDemo = {
  tag: 'mkd-drawer',
  api: {},
};

@_p.customElement({
  ...$drawerLayoutDemo,
  dependencies: [
    Checkbox,
    DemoLayout,
    DrawerLayout,
  ],
  template,
})
export class DrawerLayoutDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.expandCheckbox.stateId(this.$isExpanded$),
      this.renderers.horizontalModeCheckbox.stateId(this.$isHorizontalMode$),
      this.renderers.rootPlay.layout(this.rootPlayLayout$),
      this.renderers.drawer.expanded(this.expanded$),
      this.renderers.drawer.mode(this.drawerMode$),
    ];
  }

  @cache()
  private get expanded$(): Observable<boolean> {
    return combineLatest([
      $stateService.get(this.vine),
      this.$isExpanded$,
    ])
        .pipe(
            switchMap(([stateService, $isExpanded]) => {
              if (!$isExpanded) {
                return observableOf(undefined);
              }

              return stateService.resolve($isExpanded).self$;
            }),
            map(checkedValue => !!checkedValue),
        );
  }

  @cache()
  private get $isExpanded$(): Observable<StateId<CheckedValue>> {
    return $demoState.get(this.vine).pipe(
        map(state => state?.drawerLayoutDemo.$isExpanded),
        filterDefined(),
    );
  }

  @cache()
  private get $isHorizontalMode$(): Observable<StateId<CheckedValue>> {
    return $demoState.get(this.vine).pipe(
        map(state => state?.drawerLayoutDemo.$isHorizontalMode),
        filterDefined(),
    );
  }

  @cache()
  private get drawerMode$(): Observable<DrawerMode> {
    return combineLatest([
      $stateService.get(this.vine),
      this.$isHorizontalMode$,
    ])
        .pipe(
            switchMap(([stateService, $isHorizontalMode]) => {
              if (!$isHorizontalMode) {
                return observableOf(undefined);
              }

              return stateService.resolve($isHorizontalMode).self$;
            }),
            map(checkedValue => checkedValue ? DrawerMode.HORIZONTAL : DrawerMode.VERTICAL),
        );
  }

  @cache()
  private get rootPlayLayout$(): Observable<string> {
    return combineLatest([
      $stateService.get(this.vine),
      this.$isHorizontalMode$,
    ])
        .pipe(
            switchMap(([stateService, $isHorizontalMode]) => {
              if (!$isHorizontalMode) {
                return observableOf(undefined);
              }

              return stateService.resolve($isHorizontalMode).self$;
            }),
            map(checkedValue => checkedValue ? 'column' : 'row'),
        );
  }
}
