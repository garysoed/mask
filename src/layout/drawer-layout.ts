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
import {stringMatchConverter} from 'gs-tools/export/serializer';
import {instanceofType} from 'gs-types';
import {attributeIn, booleanParser, element, host, PersonaContext, stringParser, style} from 'persona';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {_p} from '../app/app';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

import drawerTemplate from './drawer-layout.html';


export enum DrawerMode {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export const $drawerLayout = {
  api: {
    expanded: attributeIn('expanded', booleanParser(), false),
    maxSize: attributeIn('max-size', stringParser(), ''),
    minSize: attributeIn('min-size', stringParser(), '0'),
    mode: attributeIn(
        'mode',
        stringMatchConverter(new Set([DrawerMode.HORIZONTAL, DrawerMode.VERTICAL])),
        DrawerMode.VERTICAL,
    ),
  },
  tag: 'mk-drawer-layout',
};

export const $ = {
  host: host({
    ...$drawerLayout.api,
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    styleHeight: style('height'),
    styleWidth: style('width'),
  }),
  theme: element('theme', instanceofType(HTMLStyleElement), {}),
};

@_p.customElement({
  ...$drawerLayout,
  template: drawerTemplate,
})
export class DrawerLayout extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.styleHeight(this.styleHeight$),
      this.renderers.root.styleWidth(this.styleWidth$),
    ];
  }

  @cache()
  private get styleHeight$(): Observable<string> {
    return combineLatest([
      this.inputs.host.expanded,
      this.inputs.host.maxSize,
      this.inputs.host.minSize,
      this.inputs.host.mode,
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
      this.inputs.host.expanded,
      this.inputs.host.maxSize,
      this.inputs.host.minSize,
      this.inputs.host.mode,
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
