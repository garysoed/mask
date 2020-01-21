import { _p, Icon as MaskIcon, ThemedCustomElementCtrl } from 'export';

import template from './icon.html';

export const TAG = 'mkd-icon';

@_p.customElement({
  dependencies: [
    MaskIcon,
  ],
  tag: TAG,
  template,
})
export class Icon extends ThemedCustomElementCtrl {

}
