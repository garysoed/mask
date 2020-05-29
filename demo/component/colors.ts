import { _p, ThemedCustomElementCtrl } from '../../export';
import { DemoLayout } from '../base/demo-layout';

import template from './colors.html';


export const $$ = {
  tag: 'mkd-colors',
  api: {},
};

@_p.customElement({
  ...$$,
  dependencies: [
    DemoLayout,
  ],
  template,
})
export class Colors extends ThemedCustomElementCtrl {
}
