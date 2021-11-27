import {Ctrl, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';


import template from './list-item-layout.html';


const $listItemLayout = {};

class ListItemLayout implements Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>> = [];
}

export const LIST_ITEM_LAYOUT = registerCustomElement({
  ctrl: ListItemLayout,
  spec: $listItemLayout,
  tag: 'mk-list-item-layout',
  template,
});
