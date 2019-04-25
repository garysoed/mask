/**
 * @webcomponent mk-cropped-line
 * Displays line with ellipsis to indicate cropping.
 *
 * @attr {<string} text Text to display.
 */

import { InstanceofType } from '@gs-types';
import { attributeIn, element, InitFn, onDom, textContent } from '@persona';
import { combineLatest, Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import croppedLineTemplate from './cropped-line.html';

export const $ = {
  container: element('container', InstanceofType(HTMLDivElement), {
    onCopy: onDom<ClipboardEvent>('copy'),
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

const MAX_POSTFIX_LENGTH = 3;

@_p.customElement({
  tag: 'mk-cropped-line',
  template: croppedLineTemplate,
})
export class CroppedLine extends ThemedCustomElementCtrl {
  private readonly hostTextObs = _p.input($.host._.text, this);
  private readonly onCopyObs = _p.input($.container._.onCopy, this);
  private readonly postfixBoundaryObs =
      _v.stream(this.providesPostfixBoundary, this).asObservable();
  private readonly textObs = _p.input($.host._.text, this);
  // TODO: Allow to copy a part of the text, or select all on selecting.

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupOnContainerCopy(),
      _p.render($.postfix._.text).withVine(_v.stream(this.renderPostfixTextContent, this)),
      _p.render($.prefix._.text).withVine(_v.stream(this.renderPrefixTextContent, this)),
    ];
  }

  private providesPostfixBoundary(): Observable<number> {
    return this.textObs.pipe(map(text => Math.max(text.length - MAX_POSTFIX_LENGTH, 0)));
  }

  private renderPostfixTextContent(): Observable<string> {
    return combineLatest(this.textObs, this.postfixBoundaryObs)
        .pipe(map(([text, postfixBoundary]) => text.substring(postfixBoundary)));
  }

  private renderPrefixTextContent(): Observable<string> {
    return combineLatest(this.textObs, this.postfixBoundaryObs)
        .pipe(map(([text, postfixBoundary]) => text.substring(0, postfixBoundary)));
  }

  private setupOnContainerCopy(): Observable<unknown> {
    return this.onCopyObs
        .pipe(
            withLatestFrom(this.hostTextObs),
            tap(([event, text]) => {
              const dataTransfer = event.clipboardData;
              if (!dataTransfer) {
                return;
              }
              dataTransfer.setData('text/plain', text);
              event.preventDefault();
              event.stopPropagation();
            }),
        );
  }
}
