import {cache} from 'gs-tools/export/data';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {Button} from '../../src/action/button';
import {_p} from '../../src/app/app';
import {Icon} from '../../src/display/icon';
import {ListItemLayout} from '../../src/layout/list-item-layout';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';

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
export class ButtonDemo extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

