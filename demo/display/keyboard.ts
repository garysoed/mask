import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';

import {KEYBOARD} from '../../src/display/keyboard';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';

import template from './keyboard.html';


const $keyboardDemo = { };

export class KeyboardDemo implements Ctrl {
  constructor(private readonly $: Context<typeof $keyboardDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [renderTheme(this.$)];
  }
}

export const KEYBOARD_DEMO = registerCustomElement({
  ctrl: KeyboardDemo,
  deps: [
    DEMO_LAYOUT,
    KEYBOARD,
  ],
  spec: $keyboardDemo,
  tag: 'mkd-keyboard',
  template,
});
