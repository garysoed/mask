import { elementWithTagType } from 'gs-types';
import { attributeOut, element, PersonaContext, stringParser } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { $checkbox, $drawer, _p, Checkbox, Drawer as MaskDrawer, DrawerMode, TextIconButton, ThemedCustomElementCtrl } from '../../export';
import { DemoLayout } from '../base/demo-layout';

import template from './drawer.html';


const $ = {
  drawer: element('drawer', $drawer, {}),
  expandCheckbox: element('expandCheckbox', $checkbox, {}),
  rootPlay: element('rootPlay', elementWithTagType('section'), {
    layout: attributeOut('layout', stringParser()),
  }),
  horizontalModeCheckbox: element('horizontalModeCheckbox', $checkbox, {}),
};

export const $$ = {
  tag: 'mkd-drawer',
  api: {},
};

@_p.customElement({
  ...$$,
  dependencies: [
    Checkbox,
    DemoLayout,
    MaskDrawer,
    TextIconButton,
  ],
  template,
})
export class Drawer extends ThemedCustomElementCtrl {
  private readonly expanded$ = this.declareInput($.expandCheckbox._.value);
  private readonly horizontalMode$ = this.declareInput($.horizontalModeCheckbox._.value);

  constructor(context: PersonaContext) {
    super(context);
    this.render($.rootPlay._.layout, this.renderRootPlayLayout());
    this.render($.drawer._.expanded, this.renderDrawerExpanded());
    this.render($.drawer._.mode, this.renderDrawerMode());
  }

  private renderDrawerExpanded(): Observable<boolean> {
    return this.expanded$.pipe(map(({value: mode}) => mode === true));
  }

  private renderDrawerMode(): Observable<DrawerMode> {
    return this.horizontalMode$
        .pipe(map(({value: mode}) => mode === true ? DrawerMode.HORIZONTAL : DrawerMode.VERTICAL));
  }

  private renderRootPlayLayout(): Observable<string> {
    return this.horizontalMode$.pipe(map(({value: mode}) => mode === true ? 'column' : 'row'));
  }
}
