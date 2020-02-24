/**
 * @webcomponent mk-cropped-line
 * Displays line with ellipsis to indicate cropping.
 *
 * @attr {<string} text Text to display.
 */

import { Vine } from 'grapevine';
import { InstanceofType } from 'gs-types';
import { attributeIn, element, onDom, textContent } from 'persona';
import { combineLatest, Observable } from 'rxjs';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
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
  private readonly hostTextObs = this.declareInput($.host._.text);
  private readonly onCopyObs = this.declareInput($.container._.onCopy);
  private readonly textObs = this.declareInput($.host._.text);
  private readonly postfixBoundary$ = this.textObs
      .pipe(map(text => Math.max(text.length - MAX_POSTFIX_LENGTH, 0)));
  // TODO: Allow to copy a part of the text, or select all on selecting.

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.setupOnContainerCopy();
    this.render($.postfix._.text).withFunction(this.renderPostfixTextContent);
    this.render($.prefix._.text).withFunction(this.renderPrefixTextContent);
  }

  private renderPostfixTextContent(): Observable<string> {
    return combineLatest([this.textObs, this.postfixBoundary$])
        .pipe(map(([text, postfixBoundary]) => text.substring(postfixBoundary)));
  }

  private renderPrefixTextContent(): Observable<string> {
    return combineLatest([this.textObs, this.postfixBoundary$])
        .pipe(map(([text, postfixBoundary]) => text.substring(0, postfixBoundary)));
  }

  private setupOnContainerCopy(): void {
    this.onCopyObs
        .pipe(
            withLatestFrom(this.hostTextObs),
            takeUntil(this.onDispose$),
        )
        .subscribe(([event, text]) => {
          const dataTransfer = event.clipboardData;
          if (!dataTransfer) {
            return;
          }
          dataTransfer.setData('text/plain', text);
          event.preventDefault();
          event.stopPropagation();
        });
  }
}
