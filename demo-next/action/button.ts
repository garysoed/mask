import {Context, Ctrl, registerCustomElement} from 'persona';

import {BUTTON} from '../../src-next/action/button';
import {ICON} from '../../src-next/display/icon';
import {LIST_ITEM_LAYOUT} from '../../src-next/layout/list-item-layout';
import {renderTheme} from '../../src-next/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';

import template from './button.html';


const $buttonDemo = {};

export class ButtonDemo implements Ctrl {
  readonly runs = [renderTheme(this.$)];

  constructor(private readonly $: Context<typeof $buttonDemo>) { }
}

export const BUTTON_DEMO = registerCustomElement({
  ctrl: ButtonDemo,
  deps: [
    BUTTON,
    DEMO_LAYOUT,
    LIST_ITEM_LAYOUT,
    ICON,
  ],
  spec: $buttonDemo,
  template,
  tag: 'mkd-button',
});
