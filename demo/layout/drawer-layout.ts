import {$stateService2, mutablePathSource} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {elementWithTagType} from 'gs-types';
import {attributeOut, element, PersonaContext, stringParser} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {$checkbox, Checkbox} from '../../src/action/input/checkbox';
import {_p} from '../../src/app/app';
import {$drawerLayout, DrawerLayout, DrawerMode} from '../../src/layout/drawer-layout';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoStateId} from '../core/demo-state';

import template from './drawer-layout.html';


const $ = {
  drawer: element('drawer', $drawerLayout, {}),
  expandCheckbox: element('expandCheckbox', $checkbox, {}),
  rootPlay: element('rootPlay', elementWithTagType('section'), {
    layout: attributeOut('layout', stringParser()),
  }),
  horizontalModeCheckbox: element('horizontalModeCheckbox', $checkbox, {}),
};

const isExpandedPath = mutablePathSource($demoStateId, demo => demo._('drawerLayoutDemo')._('isExpanded'));
const isHorizontalModePath = mutablePathSource($demoStateId, demo => demo._('drawerLayoutDemo')._('isHorizontalMode'));

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
      this.renderers.expandCheckbox.stateId(of(isExpandedPath.get(this.vine))),
      this.renderers.horizontalModeCheckbox.stateId(of(isHorizontalModePath.get(this.vine))),
      this.renderers.rootPlay.layout(this.rootPlayLayout$),
      this.renderers.drawer.expanded(this.expanded$),
      this.renderers.drawer.mode(this.drawerMode$),
    ];
  }

  @cache()
  private get expanded$(): Observable<boolean> {
    return $stateService2.get(this.vine)
        .$(isExpandedPath.get(this.vine))
        .pipe(map(checkedValue => !!checkedValue));
  }

  @cache()
  private get drawerMode$(): Observable<DrawerMode> {
    return $stateService2.get(this.vine)
        .$(isHorizontalModePath.get(this.vine))
        .pipe(map(checkedValue => checkedValue ? DrawerMode.HORIZONTAL : DrawerMode.VERTICAL));
  }

  @cache()
  private get rootPlayLayout$(): Observable<string> {
    return $stateService2.get(this.vine)
        .$(isHorizontalModePath.get(this.vine))
        .pipe(map(checkedValue => checkedValue ? 'column' : 'row'));
  }
}
