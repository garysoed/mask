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

import { Vine } from 'grapevine';
import { stringMatchConverter } from 'gs-tools/export/serializer';
import { InstanceofType } from 'gs-types';
import { attributeIn, element, style } from 'persona';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';

import drawerTemplate from './drawer.html';


export enum Mode {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export const $$ = {
  api: {
    expanded: attributeIn('expanded', booleanParser(), false),
    maxSize: attributeIn('max-size', stringParser(), ''),
    minSize: attributeIn('min-size', stringParser(), '0'),
    mode: attributeIn(
        'mode',
        stringMatchConverter(new Set([Mode.HORIZONTAL, Mode.VERTICAL])),
        Mode.VERTICAL,
    ),
  },
  tag: 'mk-drawer',
};

export const $ = {
  host: element({
    ...$$.api,
    styleHeight: style('height'),
    styleOverflow: style('overflow'),
    styleWidth: style('width'),
  }),
  theme: element('theme', InstanceofType(HTMLStyleElement), {}),
};

@_p.customElement({
  tag: $$.tag,
  template: drawerTemplate,
})
export class Drawer extends ThemedCustomElementCtrl {
  private readonly expandedObs = this.declareInput($.host._.expanded);
  private readonly maxSizeObs = this.declareInput($.host._.maxSize);
  private readonly minSizeObs = this.declareInput($.host._.minSize);
  private readonly modeObs = this.declareInput($.host._.mode);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.host._.styleHeight).withFunction(this.renderStyleHeight);
    this.render($.host._.styleWidth).withFunction(this.renderStyleWidth);
    this.render($.host._.styleOverflow).withFunction(() => new BehaviorSubject('hidden'));
  }

  private renderStyleHeight(): Observable<string> {
    return combineLatest([
          this.expandedObs,
          this.maxSizeObs,
          this.minSizeObs,
          this.modeObs,
        ])
        .pipe(
            map(([expanded, maxSize, minSize, mode]) => {
              if (mode === Mode.VERTICAL) {
                return '';
              }

              return expanded ? maxSize : minSize;
            }),
        );
  }

  private renderStyleWidth(): Observable<string> {
    return combineLatest([
        this.expandedObs,
        this.maxSizeObs,
        this.minSizeObs,
        this.modeObs,
    ])
        .pipe(
            map(([expanded, maxSize, minSize, mode]) => {
              if (mode === Mode.HORIZONTAL) {
                return '';
              }

              return expanded ? maxSize : minSize;
            }),
        );
  }
}
