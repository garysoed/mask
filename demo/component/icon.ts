import { _p, Icon as MaskIcon, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './icon.html';

export const $$ = {
  tag: 'mkd-icon',
  api: {},
};

@_p.customElement({
  ...$$,
  dependencies: [
    DemoLayout,
    MaskIcon,
  ],
  template,
})
export class Icon extends ThemedCustomElementCtrl {

}
