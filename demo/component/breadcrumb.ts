import { _p, Breadcrumb as MaskBreadcrumb, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './breadcrumb.html';

export const TAG = 'mkd-breadcrumb';

@_p.customElement({
  dependencies: [
    DemoLayout,
    MaskBreadcrumb,
  ],
  tag: TAG,
  template,
})
export class Breadcrumb extends ThemedCustomElementCtrl {

}
