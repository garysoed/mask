import { _p, Icon as MaskIcon, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './icon.html';

export const TAG = 'mkd-icon';

@_p.customElement({
  dependencies: [
    DemoLayout,
    MaskIcon,
  ],
  tag: TAG,
  template,
})
export class Icon extends ThemedCustomElementCtrl {

}
