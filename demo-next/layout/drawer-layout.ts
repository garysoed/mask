import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, id, oattr, registerCustomElement, SECTION} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {CHECKBOX} from '../../src-next/input/checkbox';
import {DrawerMode, DRAWER_LAYOUT} from '../../src-next/layout/drawer-layout';
import {renderTheme} from '../../src-next/theme/render-theme';
import {bindInputToState} from '../../src-next/util/bind-input-to-state';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './drawer-layout.html';


const $drawerLayoutDemo = {
  shadow: {
    drawer: id('drawer', DRAWER_LAYOUT, {}),
    expandCheckbox: id('expandCheckbox', CHECKBOX, {}),
    rootPlay: id('rootPlay', SECTION, {
      layout: oattr('layout'),
    }),
    horizontalModeCheckbox: id('horizontalModeCheckbox', CHECKBOX, {}),
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