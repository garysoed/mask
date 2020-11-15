import {cache} from 'gs-tools/export/data';
import {filterDefined} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {elementWithTagType} from 'gs-types';
import {attributeOut, element, PersonaContext, stringParser} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {Checkbox, CheckedValue} from '../../src/action/input/checkbox';
import {$simpleCheckbox} from '../../src/action/simple/simple-checkbox';
import {_p} from '../../src/app/app';
import {$stateService} from '../../src/core/state-service';
import {$drawerLayout, DrawerLayout, DrawerMode} from '../../src/layout/drawer-layout';
import {ThemedCustomElementCtrl} from '../../src/theme/themed-custom-element-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './drawer-layout.html';


const $ = {
  drawer: element('drawer', $drawerLayout, {}),
  expandCheckbox: element('expandCheckbox', $simpleCheckbox, {}),
  rootPlay: element('rootPlay', elementWithTagType('section'), {
    layout: attributeOut('layout', stringParser()),
  }),
  horizontalModeCheckbox: element('horizontalModeCheckbox', $simpleCheckbox, {}),
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
export class DrawerLayoutDemo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.render($.rootPlay._.layout, this.rootPlayLayout$);
    this.render($.drawer._.expanded, this.expanded$);
    this.render($.drawer._.mode, this.drawerMode$);
    this.render($.expandCheckbox._.stateId, this.$isExpanded$);
    this.render($.horizontalModeCheckbox._.stateId, this.$isHorizontalMode$);
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
                return observableOf(null);
              }

              return stateService.get($isExpanded);
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
                return observableOf(null);
              }

              return stateService.get($isHorizontalMode);
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
                return observableOf(null);
              }

              return stateService.get($isHorizontalMode);
            }),
            map(checkedValue => checkedValue ? 'column' : 'row'),
        );
  }
}
