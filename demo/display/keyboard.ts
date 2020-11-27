import {cache} from 'gs-tools/export/data';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {_p} from '../../src/app/app';
import {Keyboard} from '../../src/display/keyboard';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
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
export class KeyboardDemo extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}
