import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, oattr, query, registerCustomElement, SECTION} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {CHECKBOX} from '../../src/input/checkbox';
import {DrawerMode, DRAWER_LAYOUT} from '../../src/layout/drawer-layout';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';
import {bindInputToState} from '../util/bind-input-to-state';

import template from './drawer-layout.html';


const $drawerLayoutDemo = {
  shadow: {
    drawer: query('#drawer', DRAWER_LAYOUT, {}),
    expandCheckbox: query('#expandCheckbox', CHECKBOX, {}),
    rootPlay: query('#rootPlay', SECTION, {
      layout: oattr('layout'),
    }),
    horizontalModeCheckbox: query('#horizontalModeCheckbox', CHECKBOX, {}),
  },
};


export class DrawerLayoutDemo implements Ctrl {
  private readonly state = $demoState.get(this.$.vine)._('drawerLayoutDemo');

  constructor(private readonly $: Context<typeof $drawerLayoutDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      bindInputToState(this.state.$('isExpanded'), this.$.shadow.expandCheckbox),
      bindInputToState(this.state.$('isHorizontalMode'), this.$.shadow.horizontalModeCheckbox),
      this.rootPlayLayout$.pipe(this.$.shadow.rootPlay.layout()),
      this.expanded$.pipe(this.$.shadow.drawer.expanded()),
      this.drawerMode$.pipe(this.$.shadow.drawer.mode()),
    ];
  }

  @cache()
  private get expanded$(): Observable<boolean> {
    return this.state.$('isExpanded').pipe(map(checkedValue => !!checkedValue));
  }

  @cache()
  private get drawerMode$(): Observable<DrawerMode> {
    return this.state.$('isHorizontalMode').pipe(
        map(checkedValue => checkedValue ? DrawerMode.HORIZONTAL : DrawerMode.VERTICAL),
    );
  }

  @cache()
  private get rootPlayLayout$(): Observable<string> {
    return this.state.$('isHorizontalMode').pipe(
        map(checkedValue => checkedValue ? 'column' : 'row'),
    );
  }
}

export const DRAWER_LAYOUT_DEMO = registerCustomElement({
  ctrl: DrawerLayoutDemo,
  deps: [
    CHECKBOX,
    DEMO_LAYOUT,
    DRAWER_LAYOUT,
  ],
  spec: $drawerLayoutDemo,
  tag: 'mkd-drawer',
  template,
});