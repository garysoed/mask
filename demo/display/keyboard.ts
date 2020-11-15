import {PersonaContext} from 'persona';

import {_p} from '../../src/app/app';
import {Keyboard} from '../../src/display/keyboard';
import {ThemedCustomElementCtrl} from '../../src/theme/themed-custom-element-ctrl';
import {DemoLayout} from '../base/demo-layout';

import template from './keyboard.html';


export const $keyboardDemo = {
  tag: 'mkd-keyboard',
  api: {},
};

@_p.customElement({
  ...$keyboardDemo,
  dependencies: [
    DemoLayout,
    Keyboard,
  ],
  template,
})
export class KeyboardDemo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
  }
}
