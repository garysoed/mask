import {Context, Ctrl, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';

import {renderTheme} from '../theme/render-theme';


import template from './list-item-layout.html';


const $listItemLayout = {};

class ListItemLayout implements Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>> = [
    renderTheme(this.$),
  ];

  constructor(private readonly $: Context<typeof $listItemLayout>) {}
}

export const LIST_ITEM_LAYOUT = registerCustomElement({
  ctrl: ListItemLayout,
  spec: $listItemLayout,
  tag: 'mk-list-item-layout',
  template,
});
