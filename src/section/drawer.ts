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
import { ImmutableSet } from 'gs-tools/src/immutable';
import { BooleanType, EnumType, InstanceofType, StringType } from 'gs-types/export';
import { attributeIn, element } from 'persona/export/input';
import { style } from 'persona/export/output';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
import drawerTemplate from './drawer.html';

export enum Mode {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export const $ = {
  host: element({
    expanded: attributeIn('expanded', booleanParser(), BooleanType, false),
    maxSize: attributeIn('max-size', stringParser(), StringType, ''),
    minSize: attributeIn('min-size', stringParser(), StringType, '0'),
    mode: attributeIn(
        'mode',
        stringMatchConverter(ImmutableSet.of([Mode.HORIZONTAL, Mode.VERTICAL])),
        EnumType(Mode),
        Mode.VERTICAL,
    ),
    styleHeight: style('height'),
    styleOverflow: style('overflow'),
    styleWidth: style('width'),
  }),
  theme: element('theme', InstanceofType(HTMLStyleElement), {}),
};

@_p.customElement({
  input: [
    $.host._.expanded,
    $.host._.maxSize,
    $.host._.minSize,
    $.host._.mode,
  ],
  tag: 'mk-drawer',
  template: drawerTemplate,
})
class Drawer extends ThemedCustomElementCtrl {
  @_p.render($.host._.styleOverflow) readonly overflow_: string = 'hidden';

  @_p.render($.host._.styleHeight)
  renderStyleHeight_(
      @_v.vineIn($.host._.expanded.id) expandedObs: Observable<boolean>,
      @_v.vineIn($.host._.maxSize.id) maxSizeObs: Observable<string>,
      @_v.vineIn($.host._.minSize.id) minSizeObs: Observable<string>,
      @_v.vineIn($.host._.mode.id) modeObs: Observable<Mode>,
  ): Observable<string> {
    return combineLatest(expandedObs, maxSizeObs, minSizeObs, modeObs)
        .pipe(
            map(([expanded, maxSize, minSize, mode]) => {
              if (mode === Mode.VERTICAL) {
                return '';
              }

              return expanded ? maxSize : minSize;
            }),
        );
  }

  @_p.render($.host._.styleWidth)
  renderStyleWidth_(
      @_v.vineIn($.host._.expanded.id) expandedObs: Observable<boolean>,
      @_v.vineIn($.host._.maxSize.id) maxSizeObs: Observable<string>,
      @_v.vineIn($.host._.minSize.id) minSizeObs: Observable<string>,
      @_v.vineIn($.host._.mode.id) modeObs: Observable<Mode>,
  ): Observable<string> {
    return combineLatest(expandedObs, maxSizeObs, minSizeObs, modeObs)
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

export function drawer(): Config {
  return {tag: 'mk-drawer'};
}
