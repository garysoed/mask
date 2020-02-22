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

import { stringMatchConverter } from 'gs-tools/export/serializer';
import { InstanceofType } from 'gs-types';
import { attributeIn, element, InitFn, style } from 'persona';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p, _v } from '../app/app';
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

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.renderStream($.host._.styleHeight, this.renderStyleHeight),
      this.renderStream($.host._.styleWidth, this.renderStyleWidth),
      _p.render($.host._.styleOverflow)
          .withVine(_v.source(() => new BehaviorSubject('hidden'), this)),
    ];
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
