import {_p} from '../app/app';
import {ThemedCustomElementCtrl} from '../theme/themed-custom-element-ctrl';

import template from './line-layout.html';

export const $lineLayout = {
  tag: 'mk-line-layout',
  api: {},
};

@_p.customElement({
  ...$lineLayout,
  template,
})
export class LineLayout extends ThemedCustomElementCtrl {

}
