import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, iattr, query, otext, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';
import {map, scan, shareReplay, startWith} from 'rxjs/operators';

import {BUTTON} from '../../src/action/button';
import {ICON} from '../../src/display/icon';
import {DRAWER_LAYOUT} from '../../src/layout/drawer-layout';
import {LINE_LAYOUT} from '../../src/layout/line-layout';
import {LIST_ITEM_LAYOUT} from '../../src/layout/list-item-layout';
import {renderTheme} from '../../src/theme/render-theme';

import template from './demo-layout.html';


const $demoLayout = {
  host: {
    label: iattr('label'),
  },
  shadow: {
    bulletIcon: query('#bulletIcon', ICON),
    detailsButton: query('#detailsButton', BUTTON),
    detailsDrawer: query('#detailsDrawer', DRAWER_LAYOUT),
    detailsLabel: query('#detailsLabel', LINE_LAYOUT, {
      textContent: otext(),
    }),
  },
};

class DemoLayout implements Ctrl {
  constructor(private readonly $: Context<typeof $demoLayout>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.bulletIcon$.pipe(this.$.shadow.bulletIcon.icon()),
      this.detailsButtonLabel$.pipe(this.$.shadow.detailsLabel.textContent()),
      this.detailsDrawerExpanded$.pipe(this.$.shadow.detailsDrawer.expanded()),
    ];
  }

  @cache()
  private get bulletIcon$(): Observable<string> {
    return this.isDrawerExpanded$.pipe(
        map(isExpanded => isExpanded ? 'chevrondown' : 'chevronup'),
    );
  }

  @cache()
  private get detailsButtonLabel$(): Observable<string> {
    return this.$.host.label.pipe(map(label => `Details: ${label}`));
  }

  @cache()
  private get detailsDrawerExpanded$(): Observable<boolean> {
    return this.isDrawerExpanded$;
  }

  @cache()
  private get isDrawerExpanded$(): Observable<boolean> {
    return this.$.shadow.detailsButton.actionEvent
        .pipe(
            scan(acc => !acc, false),
            startWith(false),
            shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}

export const DEMO_LAYOUT = registerCustomElement({
  ctrl: DemoLayout,
  deps: [
    BUTTON,
    DRAWER_LAYOUT,
    LIST_ITEM_LAYOUT,
  ],
  spec: $demoLayout,
  tag: 'mkd-demo-layout',
  template,
});
