import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {element, host, mutationObservable, PersonaContext, textContent, ValuesOf} from 'persona';
import {Observable} from 'rxjs';
import {map, startWith, tap} from 'rxjs/operators';

import {_p} from '../app/app';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

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
export class CodeBlock extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(this.setupRenderCode());
  }

  @cache()
  protected get values(): ValuesOf<typeof $> {
    return {host: {}, root: {}};
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
