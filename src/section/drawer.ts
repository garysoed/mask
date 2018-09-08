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

import { VineImpl } from 'grapevine/export/main';
import { BooleanParser, EnumParser, StringParser } from 'gs-tools/export/parse';
import { BooleanType, EnumType, StringType } from 'gs-types/export';
import { attribute, resolveLocators, shadowHost, style } from 'persona/export/locator';
import { CustomElementCtrl } from 'persona/export/main';
import { persona_, vine_ } from '../app/app';
import drawerTemplate from './drawer.html';

export enum Mode {
  HORIZONTAL,
  VERTICAL,
}

const $ = resolveLocators({
  host: {
    el: shadowHost,
    expanded: attribute(shadowHost, 'expanded', BooleanParser, BooleanType, false),
    maxSize: attribute(shadowHost, 'max-size', StringParser, StringType, ''),
    minSize: attribute(shadowHost, 'min-size', StringParser, StringType, '0'),
    mode: attribute(shadowHost, 'mode', EnumParser(Mode), EnumType(Mode), Mode.VERTICAL),
    style: {
      height: style(shadowHost, 'height'),
      overflow: style(shadowHost, 'overflow'),
      width: style(shadowHost, 'width'),
    },
  },
});

@persona_.customElement({
  tag: 'mk-drawer',
  template: drawerTemplate,
  watch: [
    $.host.expanded,
    $.host.maxSize,
    $.host.minSize,
    $.host.mode,
  ],
})
export class Drawer extends CustomElementCtrl {
  @persona_.render($.host.style.overflow) readonly overflow_: string = 'hidden';

  init(vine: VineImpl): void {
    // Noop
  }

  @persona_.render($.host.style.height)
  renderStyleHeight_(
      @vine_.vineIn($.host.expanded.getReadingId()) expanded: boolean,
      @vine_.vineIn($.host.maxSize.getReadingId()) maxSize: string,
      @vine_.vineIn($.host.minSize.getReadingId()) minSize: string,
      @vine_.vineIn($.host.mode.getReadingId()) mode: Mode): string {
    if (mode === Mode.VERTICAL) {
      return '';
    }

    return expanded ? maxSize : minSize;
  }

  @persona_.render($.host.style.width)
  renderStyleWidth_(
      @vine_.vineIn($.host.expanded.getReadingId()) expanded: boolean,
      @vine_.vineIn($.host.maxSize.getReadingId()) maxSize: string,
      @vine_.vineIn($.host.minSize.getReadingId()) minSize: string,
      @vine_.vineIn($.host.mode.getReadingId()) mode: Mode): string {
    if (mode === Mode.HORIZONTAL) {
      return '';
    }

    return expanded ? maxSize : minSize;
  }
}

export function drawer(): {ctor: typeof Drawer} {
  return {ctor: Drawer};
}
