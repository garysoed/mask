import {cache} from 'gs-tools/export/data';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {_p} from '../../src/app/app';
import {CodeBlock} from '../../src/display/code-block';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';

import template from './code-block.html';


export const $codeBlockDemo = {
  tag: 'mkd-code-block',
  api: {},
};

@_p.customElement({
  ...$codeBlockDemo,
  dependencies: [
    DemoLayout,
    CodeBlock,
  ],
  template,
})
export class CodeBlockDemo extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}
