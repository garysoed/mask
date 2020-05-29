import { _p, IconWithText as MaskIconWithText, ThemedCustomElementCtrl } from '../../export';
import { DemoLayout } from '../base/demo-layout';

import template from './icon-with-text.html';

export const $$ = {
  tag: 'mkd-icon-with-text',
  api: {},
};

@_p.customElement({
  ...$$,
  dependencies: [
    DemoLayout,
    MaskIconWithText,
  ],
  template,
})
export class IconWithText extends ThemedCustomElementCtrl {

}
