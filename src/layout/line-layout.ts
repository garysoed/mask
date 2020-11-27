import {cache} from 'gs-tools/export/data';
import {PersonaContext, ValuesOf} from 'persona';

import {_p} from '../app/app';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

import template from './line-layout.html';


export const $lineLayout = {
  tag: 'mk-line-layout',
  api: {},
};

@_p.customElement({
  ...$lineLayout,
  template,
})
export class LineLayout extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  @cache()
  protected get values(): ValuesOf<{}> {
    return {};
  }
}
