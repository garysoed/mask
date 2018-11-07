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

import { BooleanParser, EnumParser, StringParser } from 'gs-tools/export/parse';
import { BooleanType, EnumType, InstanceofType, StringType } from 'gs-types/export';
import { attribute, element, resolveLocators, shadowHost, style } from 'persona/export/locator';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import drawerTemplate from './drawer.html';

export enum Mode {
  HORIZONTAL,
  VERTICAL,
}

export const $ = resolveLocators({
  host: {
    el: shadowHost,
    expanded: attribute(shadowHost, 'expanded', BooleanParser, BooleanType, false),
    maxSize: attribute(shadowHost, 'max-size', StringParser, StringType, ''),
    minSize: attribute(shadowHost, 'min-size', StringParser, StringType, '0'),
    mode: attribute(shadowHost, 'mode', EnumParser<Mode>(Mode), EnumType(Mode), Mode.VERTICAL),
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
  watch: [
    $.host.expanded,
    $.host.maxSize,
    $.host.minSize,
    $.host.mode,
    $.theme.el,
  ],
})
export class Drawer extends ThemedCustomElementCtrl {
  @_p.render($.host.style.overflow) readonly overflow_: string = 'hidden';

  constructor() {
    super($.theme.el);
  }

  @_p.render($.host.style.height)
  renderStyleHeight_(
      @_v.vineIn($.host.expanded.getReadingId()) expanded: boolean,
      @_v.vineIn($.host.maxSize.getReadingId()) maxSize: string,
      @_v.vineIn($.host.minSize.getReadingId()) minSize: string,
      @_v.vineIn($.host.mode.getReadingId()) mode: Mode,
  ): string {
    if (mode === Mode.VERTICAL) {
      return '';
    }

    return expanded ? maxSize : minSize;
  }

  @_p.render($.host.style.width)
  renderStyleWidth_(
      @_v.vineIn($.host.expanded.getReadingId()) expanded: boolean,
      @_v.vineIn($.host.maxSize.getReadingId()) maxSize: string,
      @_v.vineIn($.host.minSize.getReadingId()) minSize: string,
      @_v.vineIn($.host.mode.getReadingId()) mode: Mode,
  ): string {
    if (mode === Mode.HORIZONTAL) {
      return '';
    }

    return expanded ? maxSize : minSize;
  }
}

export function drawer(): Config {
  return {ctor: Drawer};
}
