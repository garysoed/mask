import { _p, TextInput as MaskTextInput, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './text-input.html';

export const $$ = {
  tag: 'mkd-text-input',
  api: {},
};

@_p.customElement({
  ...$$,
  dependencies: [
    DemoLayout,
    MaskTextInput,
  ],
  template,
})
export class TextInput extends ThemedCustomElementCtrl {

}
