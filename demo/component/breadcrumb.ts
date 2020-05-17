import { _p, Breadcrumb as MaskBreadcrumb, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './breadcrumb.html';

export const $$ = {
  tag: 'mkd-breadcrumb',
  api: {},
};

@_p.customElement({
  ...$$,
  dependencies: [
    DemoLayout,
    MaskBreadcrumb,
  ],
  template,
})
export class Breadcrumb extends ThemedCustomElementCtrl {

}
