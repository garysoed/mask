import { $checkbox, $drawer, _p, Checkbox, Drawer as MaskDrawer, DrawerMode, stringParser, TextIconButton, ThemedCustomElementCtrl } from 'export';
import { Vine } from 'grapevine';
import { elementWithTagType } from 'gs-types';
import { attributeOut, element } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

export const TAG = 'mkd-drawer';

@_p.customElement({
  dependencies: [
    Checkbox,
    DemoLayout,
    MaskDrawer,
    TextIconButton,
  ],
  tag: TAG,
  template,
})
export class Drawer extends ThemedCustomElementCtrl {
  private readonly expanded$ = this.declareInput($.expandCheckbox._.value);
  private readonly horizontalMode$ = this.declareInput($.horizontalModeCheckbox._.value);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.render($.rootPlay._.layout).withFunction(this.renderRootPlayLayout);
    this.render($.drawer._.expanded).withFunction(this.renderDrawerExpanded);
    this.render($.drawer._.mode).withFunction(this.renderDrawerMode);
  }

  private renderDrawerExpanded(): Observable<boolean> {
    return this.expanded$.pipe(map(mode => mode === true));
  }

  private renderDrawerMode(): Observable<DrawerMode> {
    return this.horizontalMode$
        .pipe(map(mode => mode === true ? DrawerMode.HORIZONTAL : DrawerMode.VERTICAL));
  }

  private renderRootPlayLayout(): Observable<string> {
    return this.horizontalMode$.pipe(map(mode => mode === true ? 'column' : 'row'));
  }
}
