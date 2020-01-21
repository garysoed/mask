import { _p, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './colors.html';


export const TAG = 'mkd-colors';

@_p.customElement({
  dependencies: [
    DemoLayout,
  ],
  tag: TAG,
  template,
})
export class Colors extends ThemedCustomElementCtrl {
}
