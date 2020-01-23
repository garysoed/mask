import { _p, IconWithText as MaskIconWithText, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './icon-with-text.html';

export const TAG = 'mkd-icon-with-text';

@_p.customElement({
  dependencies: [
    DemoLayout,
    MaskIconWithText,
  ],
  tag: TAG,
  template,
})
export class IconWithText extends ThemedCustomElementCtrl {

}
