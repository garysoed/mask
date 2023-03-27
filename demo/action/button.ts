import {Context, Ctrl, registerCustomElement} from 'persona';

import {BUTTON} from '../../src/action/button';
import {ICON} from '../../src/display/icon';
import {LIST_ITEM_LAYOUT} from '../../src/layout/list-item-layout';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';

import template from './button.html';


const $buttonDemo = {};

class ButtonDemo implements Ctrl {
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

