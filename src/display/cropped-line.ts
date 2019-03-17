/**
 * @webcomponent mk-cropped-line
 * Displays line with ellipsis to indicate cropping.
 *
 * @attr {<string} text Text to display.
 */

import { instanceStreamId } from 'grapevine/export/component';
import { InstanceofType, NumberType } from 'gs-types/export';
import { attributeIn, element, onDom } from 'persona/export/input';
import { textContent } from 'persona/export/output';
import { combineLatest, Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import croppedLineTemplate from './cropped-line.html';

export const $ = {
  container: element('container', InstanceofType(HTMLDivElement), {
    onCopy: onDom('copy'),
  }),
  host: element({
    text: attributeIn('text', stringParser(), ''),
  }),
  postfix: element('postfix', InstanceofType(HTMLElement), {
    text: textContent(),
  }),
  prefix: element('prefix', InstanceofType(HTMLElement), {
    text: textContent(),
  }),
};

export const $postfixBoundary = instanceStreamId('postfixBoundary', NumberType);
const MAX_POSTFIX_LENGTH = 3;

@_p.customElement({
  tag: 'mk-cropped-line',
  template: croppedLineTemplate,
})
export class CroppedLine extends ThemedCustomElementCtrl {
  // TODO: Allow to copy a part of the text, or select all on selecting.

  @_p.onCreate()
  onContainerCopy_(
      @_p.input($.container._.onCopy) onCopyObs: Observable<ClipboardEvent>,
      @_p.input($.host._.text) hostTextObs: Observable<string>,
  ): Observable<unknown> {
    return onCopyObs
        .pipe(
            withLatestFrom(hostTextObs),
            tap(([event, text]) => {
              event.clipboardData.setData('text/plain', text);
              event.preventDefault();
              event.stopPropagation();
            }),
        );
  }

  @_v.vineOut($postfixBoundary)
  providesPostfixBoundary_(
      @_p.input($.host._.text) textObs: Observable<string>): Observable<number> {
    return textObs.pipe(map(text => Math.max(text.length - MAX_POSTFIX_LENGTH, 0)));
  }

  @_p.render($.postfix._.text)
  renderPostfixTextContent_(
      @_p.input($.host._.text) textObs: Observable<string>,
      @_v.vineIn($postfixBoundary) postfixBoundaryObs: Observable<number>): Observable<string> {
    return combineLatest(textObs, postfixBoundaryObs)
        .pipe(map(([text, postfixBoundary]) => text.substring(postfixBoundary)));
  }

  @_p.render($.prefix._.text)
  renderPrefixTextContent_(
      @_p.input($.host._.text) textObs: Observable<string>,
      @_v.vineIn($postfixBoundary) postfixBoundaryObs: Observable<number>): Observable<string> {
    return combineLatest(textObs, postfixBoundaryObs)
        .pipe(map(([text, postfixBoundary]) => text.substring(0, postfixBoundary)));
  }
}

export function croppedLine(): Config {
  return {tag: 'mk-cropped-line'};
}
