import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import template from './list-item-layout.html';

export const $listItemLayout = {
  tag: 'mk-list-item-layout',
  api: {},
};

@_p.customElement({
  ...$listItemLayout,
  template,
})
export class ListItemLayout extends ThemedCustomElementCtrl {

}
