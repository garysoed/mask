import { element, integerParser, PersonaContext } from 'persona';
import { Observable, of as observableOf } from 'rxjs';

import { $textInput, _p, CodeBlock as MaskCodeBlock, ThemedCustomElementCtrl } from '../../export';
import { DemoLayout } from '../base/demo-layout';

import template from './code-block.html';


export const $$ = {
  tag: 'mkd-code-block',
  api: {},
};

@_p.customElement({
  ...$$,
  dependencies: [
    DemoLayout,
    MaskCodeBlock,
  ],
  template,
})
export class CodeBlock extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
  }
}
