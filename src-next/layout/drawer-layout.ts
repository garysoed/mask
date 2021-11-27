/**
 * @webcomponent mk-drawer
 * Displays a drawer that gets expanded on command.
 *
 * @attr {<boolean} expanded True iff the drawer should be expanded.
 * @attr {<Mode} mode Mode of the drawer. Defaults to vertical.
 * @attr {<size} minSize Size of the drawer when collapsed.
 * @attr {<size} maxSize Size of the drawer when expanded.
 * @slot The content of the drawer.
 */

import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {Context, Ctrl, DIV, iattr, id, iflag, ostyle, registerCustomElement} from 'persona';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {renderTheme} from '../theme/render-theme';

import template from './drawer-layout.html';


export enum DrawerMode {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

const $drawerLayout = {
  host: {
    expanded: iflag('expanded'),
    maxSize: iattr('max-size'),
    minSize: iattr('min-size'),
    mode: iattr('mode'),
  },
  shadow: {
    root: id('root', DIV, {
      styleHeight: ostyle('height'),
      styleWidth: ostyle('width'),
    }),
  },
};

export class DrawerLayout implements Ctrl {
  private readonly maxSize$ = this.$.host.maxSize.pipe(mapNullableTo(''));
  private readonly minSize$ = this.$.host.minSize.pipe(mapNullableTo('0'));

  constructor(private readonly $: Context<typeof $drawerLayout>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.styleHeight$.pipe(this.$.shadow.root.styleHeight()),
      this.styleWidth$.pipe(this.$.shadow.root.styleWidth()),
    ];
  }

  @cache()
  private get styleHeight$(): Observable<string> {
    return combineLatest([
      this.$.host.expanded,
      this.maxSize$,
      this.minSize$,
      this.$.host.mode,
    ])
        .pipe(
            map(([expanded, maxSize, minSize, mode]) => {
              if (mode === DrawerMode.VERTICAL) {
                return '100%';
              }

              return expanded ? maxSize : minSize;
            }),
        );
  }

  @cache()
  private get styleWidth$(): Observable<string> {
    return combineLatest([
      this.$.host.expanded,
      this.maxSize$,
      this.minSize$,
      this.$.host.mode,
    ])
        .pipe(
            map(([expanded, maxSize, minSize, mode]) => {
              if (mode === DrawerMode.HORIZONTAL) {
                return '100%';
              }

              return expanded ? maxSize : minSize;
            }),
        );
  }
}

export const DRAWER_LAYOUT = registerCustomElement({
  ctrl: DrawerLayout,
  spec: $drawerLayout,
  tag: 'mk-drawer-layout',
  template,
});
