import {Context, Ctrl, registerCustomElement} from 'persona';

import {renderTheme} from '../../src-next/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';

import template from './texts.html';


const $textsDemo = {};

export class TextsDemo implements Ctrl {
  readonly runs = [renderTheme(this.$)];

  constructor(private readonly $: Context<typeof $textsDemo>) { }
}

export const TEXTS_DEMO = registerCustomElement({
  ctrl: TextsDemo,
  deps: [
    DEMO_LAYOUT,
  ],
  spec: $textsDemo,
  tag: 'mkd-texts',
  template,
});

