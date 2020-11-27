import {cache} from 'gs-tools/export/data';
import {PersonaContext, ValuesOf} from 'persona';

import {_p} from '../app/app';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

import template from './list-item-layout.html';


export const $listItemLayout = {
  tag: 'mk-list-item-layout',
  api: {},
};

@_p.customElement({
  ...$listItemLayout,
  template,
})
export class ListItemLayout extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  @cache()
  protected get values(): ValuesOf<{}> {
    return {};
  }
}
