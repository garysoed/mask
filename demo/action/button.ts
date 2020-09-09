import { PersonaContext } from 'persona';

import { Button } from '../../src/action/button';
import { _p } from '../../src/app/app';
import { Icon } from '../../src/display/icon';
import { ListItemLayout } from '../../src/layout/list-item-layout';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';
import { DemoLayout } from '../base/demo-layout';

import template from './button.html';


export const $buttonDemo = {
  tag: 'mkd-button',
  api: {},
};

@_p.customElement({
  ...$buttonDemo,
  dependencies: [
    Button,
    DemoLayout,
    ListItemLayout,
    Icon,
  ],
  template,
})
export class ButtonDemo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
  }
}

