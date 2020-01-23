import { _p, TextInput as MaskTextInput, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './text-input.html';

export const TAG = 'mkd-text-input';

@_p.customElement({
  dependencies: [
    DemoLayout,
    MaskTextInput,
  ],
  tag: TAG,
  template,
})
export class TextInput extends ThemedCustomElementCtrl {

}
