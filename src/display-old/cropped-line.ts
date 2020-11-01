/**
 * @webcomponent mk-cropped-line
 * Displays line with ellipsis to indicate cropping.
 *
 * @attr {<string} text Text to display.
 */

import { Observable, combineLatest } from 'rxjs';
import { PersonaContext, attributeIn, element, host, onDom, stringParser, textContent } from 'persona';
import { instanceofType } from 'gs-types';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { _p } from '../app/app';

import croppedLineTemplate from './cropped-line.html';

export const $croppedLine = {
  api: {
    text: attributeIn('text', stringParser(), ''),
  },
  tag: 'mk-cropped-line',
};

export const $ = {
  container: element('container', instanceofType(HTMLDivElement), {
    onCopy: onDom<ClipboardEvent>('copy'),
  }),
  host: host($croppedLine.api),
  postfix: element('postfix', instanceofType(HTMLElement), {
    text: textContent(),
  }),
  prefix: element('prefix', instanceofType(HTMLElement), {
    text: textContent(),
  }),
};

const MAX_POSTFIX_LENGTH = 3;

@_p.customElement({
  ...$croppedLine,
  template: croppedLineTemplate,
})
export class CroppedLine extends ThemedCustomElementCtrl {
  private readonly hostText$ = this.declareInput($.host._.text);
  private readonly onCopy$ = this.declareInput($.container._.onCopy);
  private readonly text$ = this.declareInput($.host._.text);
  private readonly postfixBoundary$ = this.text$
      .pipe(map(text => Math.max(text.length - MAX_POSTFIX_LENGTH, 0)));
  // TODO: Allow to copy a part of the text, or select all on selecting.

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupOnContainerCopy());
    this.render($.postfix._.text, this.renderPostfixTextContent());
    this.render($.prefix._.text, this.renderPrefixTextContent());
  }

  private renderPostfixTextContent(): Observable<string> {
    return combineLatest([this.text$, this.postfixBoundary$])
        .pipe(map(([text, postfixBoundary]) => text.substring(postfixBoundary)));
  }

  private renderPrefixTextContent(): Observable<string> {
    return combineLatest([this.text$, this.postfixBoundary$])
        .pipe(map(([text, postfixBoundary]) => text.substring(0, postfixBoundary)));
  }

  private setupOnContainerCopy(): Observable<unknown> {
    return this.onCopy$
        .pipe(
            withLatestFrom(this.hostText$),
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
