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
import { attributeIn, element, resolveLocators, shadowHost, style } from 'persona/export/locator';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
import drawerTemplate from './drawer.html';

export enum Mode {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export const $ = resolveLocators({
  host: {
    el: shadowHost,
    expanded: attributeIn(shadowHost, 'expanded', booleanParser(), BooleanType, false),
    maxSize: attributeIn(shadowHost, 'max-size', stringParser(), StringType, ''),
    minSize: attributeIn(shadowHost, 'min-size', stringParser(), StringType, '0'),
    mode: attributeIn(
        shadowHost,
        'mode',
        stringMatchConverter(ImmutableSet.of([Mode.HORIZONTAL, Mode.VERTICAL])),
        EnumType(Mode),
        Mode.VERTICAL,
    ),
    style: {
      height: style(shadowHost, 'height'),
      overflow: style(shadowHost, 'overflow'),
      width: style(shadowHost, 'width'),
    },
  },
  theme: {
    el: element('#theme', InstanceofType(HTMLStyleElement)),
  },
});

@_p.customElement({
  tag: 'mk-drawer',
  template: drawerTemplate,
})
class Drawer extends ThemedCustomElementCtrl {
  @_p.render($.host.style.overflow) readonly overflow_: string = 'hidden';

  @_p.render($.host.style.height)
  renderStyleHeight_(
      @_p.input($.host.expanded) expanded: boolean,
      @_p.input($.host.maxSize) maxSize: string,
      @_p.input($.host.minSize) minSize: string,
      @_p.input($.host.mode) mode: Mode,
  ): string {
    if (mode === Mode.VERTICAL) {
      return '';
    }

    return expanded ? maxSize : minSize;
  }

  @_p.render($.host.style.width)
  renderStyleWidth_(
      @_p.input($.host.expanded) expanded: boolean,
      @_p.input($.host.maxSize) maxSize: string,
      @_p.input($.host.minSize) minSize: string,
      @_p.input($.host.mode) mode: Mode,
  ): string {
    if (mode === Mode.HORIZONTAL) {
      return '';
    }

    return expanded ? maxSize : minSize;
  }
}

export function drawer(): Config {
  return {tag: 'mk-drawer'};
}
