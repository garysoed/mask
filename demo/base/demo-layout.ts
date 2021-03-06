import {cache} from 'gs-tools/export/data';
import {attributeIn, element, host, PersonaContext, stringParser, textContent, ValuesOf} from 'persona';
import {Observable} from 'rxjs';
import {map, scan, startWith} from 'rxjs/operators';

import {$button, Button} from '../../src/action/button';
import {_p} from '../../src/app/app';
import {$icon} from '../../src/display/icon';
import {$drawerLayout, DrawerLayout} from '../../src/layout/drawer-layout';
import {$lineLayout} from '../../src/layout/line-layout';
import {ListItemLayout} from '../../src/layout/list-item-layout';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';

import template from './demo-layout.html';


const $$ = {
  api: {
    label: attributeIn('label', stringParser()),
  },
  tag: 'mkd-demo-layout',
};

const $ = {
  bulletIcon: element('bulletIcon', $icon, {}),
  detailsButton: element('detailsButton', $button, {}),
  detailsDrawer: element('detailsDrawer', $drawerLayout, {}),
  detailsLabel: element('detailsLabel', $lineLayout, {
    textContent: textContent(),
  }),
  host: host($$.api),
};

@_p.customElement({
  ...$$,
  dependencies: [
    Button,
    DrawerLayout,
    ListItemLayout,
  ],
  template,
})
export class DemoLayout extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get values(): ValuesOf<typeof $> {
    return {
      bulletIcon: {icon: this.bulletIcon$},
      detailsLabel: {textContent: this.detailsButtonLabel$},
      detailsDrawer: {expanded: this.detailsDrawerExpanded$},
    };
  }

  @cache()
  private get bulletIcon$(): Observable<string> {
    return this.isDrawerExpanded$.pipe(
        map(isExpanded => isExpanded ? 'chevrondown' : 'chevronup'),
    );
  }

  @cache()
  private get detailsButtonLabel$(): Observable<string> {
    return this.inputs.host.label.pipe(map(label => `Details: ${label}`));
  }

  @cache()
  private get detailsDrawerExpanded$(): Observable<boolean> {
    return this.isDrawerExpanded$;
  }

  @cache()
  private get isDrawerExpanded$(): Observable<boolean> {
    return this.inputs.detailsButton.actionEvent
        .pipe(
            scan(acc => !acc, false),
            startWith(false),
        );
  }
}
