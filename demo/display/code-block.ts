import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';

import {CODE_BLOCK} from '../../src-next/display/code-block';
import {renderTheme} from '../../src-next/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';

import template from './code-block.html';


export const $codeBlockDemo = { };

export class CodeBlockDemo implements Ctrl {
  constructor(private readonly $: Context<typeof $codeBlockDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
    ];
  }
}

export const CODE_BLOCK_DEMO = registerCustomElement({
  ctrl: CodeBlockDemo,
  deps: [
    DEMO_LAYOUT,
    CODE_BLOCK,
  ],
  spec: $codeBlockDemo,
  tag: 'mkd-code-block',
  template,
});
