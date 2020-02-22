import { $checkbox, $drawer, _p, Checkbox, Drawer as MaskDrawer, stringParser, TextIconButton, ThemedCustomElementCtrl } from 'export';

import { elementWithTagType } from 'gs-types';
import { attributeOut, element, InitFn } from 'persona';
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

  getInitFunctions(): readonly InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.renderStream($.rootPlay._.layout, this.renderRootPlayLayout),
      this.renderStream($.drawer._.expanded, this.renderDrawerExpanded),
      this.renderStream($.drawer._.mode, this.renderDrawerMode),
    ];
  }

  private renderDrawerExpanded(): Observable<boolean> {
    return this.expanded$.pipe(map(mode => mode === true));
  }

  private renderDrawerMode(): Observable<string> {
    return this.horizontalMode$.pipe(map(mode => mode === true ? 'horizontal' : 'vertical'));
  }

  private renderRootPlayLayout(): Observable<string> {
    return this.horizontalMode$.pipe(map(mode => mode === true ? 'column' : 'row'));
  }
}
