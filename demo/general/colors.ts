import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { classToggle, element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';

import { _p } from '../../src/app/app';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';
import { DemoLayout } from '../base/demo-layout';
import { $isDark } from '../core/is-dark';

import template from './colors.html';


export const $colors = {
  tag: 'mkd-colors',
  api: {},
};

const $ = {
  table: element('table', instanceofType(HTMLTableElement), {
    darkClass: classToggle('dark'),
  }),
};

@_p.customElement({
  ...$colors,
  dependencies: [
    DemoLayout,
  ],
  template,
})
export class Colors extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.table._.darkClass, this.isDark$);
  }

  @cache()
  private get isDark$(): Observable<boolean> {
    return $isDark.get(this.vine);
  }
}
