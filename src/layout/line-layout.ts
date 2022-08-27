import {Context, Ctrl, registerCustomElement} from 'persona';

import {renderTheme} from '../theme/render-theme';

import template from './line-layout.html';


const $lineLayout = {};

class LineLayout implements Ctrl {
  constructor(private readonly $: Context<typeof $lineLayout>) {}

  readonly runs = [renderTheme(this.$)];
}

export const LINE_LAYOUT = registerCustomElement({
  ctrl: LineLayout,
  spec: $lineLayout,
  tag: 'mk-line-layout',
  template,
});
