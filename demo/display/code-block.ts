import {PersonaContext} from 'persona';

import {_p} from '../../src/app/app';
import {CodeBlock} from '../../src/display/code-block';
import {ThemedCustomElementCtrl} from '../../src/theme/themed-custom-element-ctrl';
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
export class CodeBlockDemo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
  }
}
