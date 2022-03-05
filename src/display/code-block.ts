import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, query, itarget, itext, otext, PRE, registerCustomElement} from 'persona';
import {combineLatest, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {renderTheme} from '../theme/render-theme';

import template from './code-block.html';


interface HighlightJs {
  highlightBlock(node: Node): void;
}

declare const hljs: HighlightJs;

export const $codeBlock = {
  host: {
    text: itext(),
  },
  shadow: {
    root: query('#root', PRE, {
      target: itarget(),
      text: otext(),
    }),
  },
};

class CodeBlock implements Ctrl {
  constructor(private readonly $: Context<typeof $codeBlock>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.$.host.text.pipe(this.$.shadow.root.text()),
      combineLatest([
        this.$.host.text,
        this.$.shadow.root.target,
      ])
          .pipe(
              tap(([, rootTarget]) => {
                hljs.highlightBlock(rootTarget);
              }),
          ),
    ];
  }
}

export const CODE_BLOCK = registerCustomElement({
  ctrl: CodeBlock,
  spec: $codeBlock,
  tag: 'mk-code-block',
  template,
});