import { Observable } from 'rxjs';
import { PersonaContext, element, host, mutationObservable, textContent } from 'persona';
import { instanceofType } from 'gs-types';
import { map, startWith, tap } from 'rxjs/operators';

import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { _p } from '../app/app';

import template from './code-block.html';


interface HighlightJs {
  highlightBlock(node: Node): void;
}

declare const hljs: HighlightJs;

export const $codeBlock = {
  tag: 'mk-code-block',
  api: {},
};

const $ = {
  host: host($codeBlock.api),
  root: element('root', instanceofType(HTMLPreElement), {
    text: textContent(),
  }),
};

@_p.customElement({
  ...$codeBlock,
  template,
})
export class CodeBlock extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupRenderCode());
  }

  private setupRenderCode(): Observable<unknown> {
    const hostEl = $.host.getSelectable(this.context);
    return mutationObservable(hostEl, {childList: true})
        .pipe(
            startWith({}),
            map(() => hostEl.textContent || ''),
            $.root._.text.output(this.context),
            tap(() => {
              hljs.highlightBlock($.root.getSelectable(this.context));
            }),
        );
  }
}
