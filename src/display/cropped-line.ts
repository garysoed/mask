/**
 * @webcomponent mk-cropped-line
 * Displays line with ellipsis to indicate cropping.
 *
 * @attr {<string} text Text to display.
 */

import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { StringParser } from 'gs-tools/export/parse';
import { InstanceofType, NumberType, StringType } from 'gs-types/export';
import { attribute, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { take } from 'rxjs/operators';
import { persona_, vine_ } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import croppedLineTemplate from './cropped-line.html';

export const $ = resolveLocators({
  container: {
    el: element('#container', InstanceofType(HTMLDivElement)),
  },
  host: {
    el: shadowHost,
    text: attribute(
        shadowHost,
        'text',
        StringParser,
        StringType,
        '',
    ),
  },
  postfix: {
    el: element('#postfix', InstanceofType(HTMLElement)),
    textContent: textContent(element('postfix.el')),
  },
  prefix: {
    el: element('#prefix', InstanceofType(HTMLElement)),
    textContent: textContent(element('prefix.el')),
  },
  theme: {
    el: element('#theme', InstanceofType(HTMLStyleElement)),
  },
});

export const $postfixBoundary = instanceStreamId('postfixBoundary', NumberType);

const MAX_POSTFIX_LENGTH = 3;

@persona_.customElement({
  tag: 'mk-cropped-line',
  template: croppedLineTemplate,
  watch: [
    $.container.el,
    $.host.text,
    $.postfix.el,
    $.prefix.el,
    $.theme.el,
  ],
})
class CroppedLine extends ThemedCustomElementCtrl {
  constructor() {
    super($.theme.el);
  }

  @persona_.onDom($.container.el, 'copy')
  onContainerCopy_(event: ClipboardEvent, vine: VineImpl): void {
    vine.getObservable($.host.text.getReadingId(), this)
        .pipe(take(1))
        .subscribe(text => {
          event.clipboardData.setData('text/plain', text);
        });
    event.preventDefault();
    event.stopPropagation();
  }

  @vine_.vineOut($postfixBoundary)
  providesPostfixBoundary_(
      @vine_.vineIn($.host.text.getReadingId()) text: string): number {
    return Math.max(text.length - MAX_POSTFIX_LENGTH, 0);
  }

  @persona_.render($.postfix.textContent)
  renderPostfixTextContent_(
      @persona_.input($.host.text) text: string,
      @vine_.vineIn($postfixBoundary) postfixBoundary: number): string {
    return text.substring(postfixBoundary);
  }

  @persona_.render($.prefix.textContent)
  renderPrefixTextContent_(
      @persona_.input($.host.text) text: string,
      @vine_.vineIn($postfixBoundary) postfixBoundary: number): string {
    return text.substring(0, postfixBoundary);
  }
}

export function croppedLine(): Config {
  return {ctor: CroppedLine};
}
