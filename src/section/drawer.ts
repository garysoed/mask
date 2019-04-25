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

import { createImmutableSet } from '@gs-tools/collect';
import { stringMatchConverter } from '@gs-tools/serializer';
import { InstanceofType } from '@gs-types';
import { attributeIn, element, InitFn, style } from '@persona';
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
  expanded: attributeIn('expanded', booleanParser(), false),
  maxSize: attributeIn('max-size', stringParser(), ''),
  minSize: attributeIn('min-size', stringParser(), '0'),
  mode: attributeIn(
      'mode',
      stringMatchConverter(createImmutableSet([Mode.HORIZONTAL, Mode.VERTICAL])),
      Mode.VERTICAL,
  ),
};

export const $ = {
  host: element({
    ...$$,
    styleHeight: style('height'),
    styleOverflow: style('overflow'),
    styleWidth: style('width'),
  }),
  theme: element('theme', InstanceofType(HTMLStyleElement), {}),
};

@_p.customElement({
  tag: 'mk-drawer',
  template: drawerTemplate,
})
export class Drawer extends ThemedCustomElementCtrl {
  private readonly expandedObs = _p.input($.host._.expanded, this);
  private readonly maxSizeObs = _p.input($.host._.maxSize, this);
  private readonly minSizeObs = _p.input($.host._.minSize, this);
  private readonly modeObs = _p.input($.host._.mode, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.host._.styleHeight).withVine(_v.stream(this.renderStyleHeight, this)),
      _p.render($.host._.styleWidth).withVine(_v.stream(this.renderStyleWidth, this)),
      _p.render($.host._.styleOverflow)
          .withVine(_v.source(() => new BehaviorSubject('hidden'), this)),
    ];
  }

  private renderStyleHeight(): Observable<string> {
    return combineLatest(
        this.expandedObs,
        this.maxSizeObs,
        this.minSizeObs,
        this.modeObs,
        )
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
    return combineLatest(
        this.expandedObs,
        this.maxSizeObs,
        this.minSizeObs,
        this.modeObs,
        )
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
