/**
 * @webcomponent mk-cropped-line
 * Displays line with ellipsis to indicate cropping.
 *
 * @attr {<string} text Text to display.
 */

import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { InstanceofType, NumberType, StringType } from 'gs-types/export';
import { attributeIn, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import croppedLineTemplate from './cropped-line.html';

export const $ = resolveLocators({
  container: {
    el: element('#container', InstanceofType(HTMLDivElement)),
  },
  host: {
    el: shadowHost,
    text: attributeIn(shadowHost, 'text', stringParser(), StringType, ''),
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

@_p.customElement({
  tag: 'mk-cropped-line',
  template: croppedLineTemplate,
  watch: [
    $.container.el,
    $.host.text,
  ],
})
class CroppedLine extends ThemedCustomElementCtrl {
  @_p.onDom($.container.el, 'copy')
  onContainerCopy_(event: ClipboardEvent, vine: VineImpl): void {
    vine.getObservable($.host.text.getReadingId(), this)
        .pipe(take(1))
        .subscribe(text => {
          event.clipboardData.setData('text/plain', text);
        });
    event.preventDefault();
    event.stopPropagation();
  }

  @_v.vineOut($postfixBoundary)
  providesPostfixBoundary_(
      @_p.input($.host.text) textObs: Observable<string>): Observable<number> {
    return textObs.pipe(map(text => Math.max(text.length - MAX_POSTFIX_LENGTH, 0)));
  }

  @_p.render($.postfix.textContent)
  renderPostfixTextContent_(
      @_p.input($.host.text) textObs: Observable<string>,
      @_v.vineIn($postfixBoundary) postfixBoundaryObs: Observable<number>): Observable<string> {
    return combineLatest(textObs, postfixBoundaryObs)
        .pipe(map(([text, postfixBoundary]) => text.substring(postfixBoundary)));
  }

  @_p.render($.prefix.textContent)
  renderPrefixTextContent_(
      @_p.input($.host.text) textObs: Observable<string>,
      @_v.vineIn($postfixBoundary) postfixBoundaryObs: Observable<number>): Observable<string> {
    return combineLatest(textObs, postfixBoundaryObs)
        .pipe(map(([text, postfixBoundary]) => text.substring(0, postfixBoundary)));
  }
}

export function croppedLine(): Config {
  return {tag: 'mk-cropped-line'};
}
