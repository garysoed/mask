import {Ctrl, registerCustomElement} from 'persona';

import template from './line-layout.html';


const $lineLayout = {};

class LineLayout implements Ctrl {
  readonly runs = [];
}

export const LINE_LAYOUT = registerCustomElement({
  ctrl: LineLayout,
  spec: $lineLayout,
  tag: 'mk-line-layout',
  template,
});
