import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, id, oclass, registerCustomElement, TABLE} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {renderTheme} from '../../src-next/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './colors.html';


const $colorsDemo = {
  shadow: {
    table: id('table', TABLE, {
      darkClass: oclass('dark'),
    }),
  },
};


class ColorsDemo implements Ctrl {
  constructor(private readonly $: Context<typeof $colorsDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      $demoState.get(this.$.vine).$('isDarkMode').pipe(
          map(isDark => !!isDark),
          this.$.shadow.table.darkClass(),
      ),
    ];
  }
}

export const COLORS_DEMO = registerCustomElement({
  ctrl: ColorsDemo,
  deps:[
    DEMO_LAYOUT,
  ],
  spec: $colorsDemo,
  tag: 'mkd-colors',
  template,
});
