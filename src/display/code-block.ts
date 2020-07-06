import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { element, host, mutationObservable, PersonaContext, textContent } from 'persona';
import { Observable } from 'rxjs';
import { map, mapTo, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import template from './code-block.html';

interface HighlightJs {
  highlightBlock(node: Node): void;
}

declare const hljs: HighlightJs;

export const $$ = {
  tag: 'mk-code-block',
  api: {},
};

const $ = {
  host: host($$.api),
  root: element('root', instanceofType(HTMLPreElement), {
    text: textContent(),
  }),
};

@_p.customElement({
  ...$$,
  template,
})
export class CodeBlock extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupRenderCode());
  }

  private setupRenderCode(): Observable<unknown> {
    return this.declareInput($.host).pipe(
        switchMap(hostEl => {
          return mutationObservable(hostEl, {childList: true})
              .pipe(
                  startWith({}),
                  map(() => hostEl.textContent || ''),
              );
        }),
        $.root._.text.output(this.context),
        withLatestFrom(this.declareInput($.root)),
        tap(([, rootEl]) => {
          hljs.highlightBlock(rootEl);
        }),
    );
  }
}
