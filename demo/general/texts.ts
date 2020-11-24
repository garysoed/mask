import {cache} from 'gs-tools/export/data';
import {PersonaContext, ValuesOf} from 'persona';

import {_p} from '../../src/app/app';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';

import template from './texts.html';


export const $textsDemo = {
  tag: 'mkd-text',
  api: {},
};

@_p.customElement({
  ...$textsDemo,
  dependencies: [
    DemoLayout,
  ],
  template,
})
export class TextsDemo extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  @cache()
  protected get values(): ValuesOf<{}> {
    return {};
  }
}

