import { cache } from 'gs-tools/export/data';
import { attributeIn, element, host, PersonaContext, stringParser, textContent } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { $button, Button } from '../../src/action/button';
import { _p } from '../../src/app/app';
import { $icon } from '../../src/display/icon';
import { $lineLayout } from '../../src/layout/line-layout';
import { ListItemLayout } from '../../src/layout/list-item-layout';
import { $drawer, Drawer } from '../../src/section-old/drawer';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';

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
  detailsDrawer: element('detailsDrawer', $drawer, {}),
  detailsLabel: element('detailsLabel', $lineLayout, {
    textContent: textContent(),
  }),
  host: host($$.api),
};

@_p.customElement({
  ...$$,
  dependencies: [
    Button,
    Drawer,
    ListItemLayout,
  ],
  template,
})
export class DemoLayout extends ThemedCustomElementCtrl {
  private readonly isDrawerExpanded$ = new BehaviorSubject(false);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.bulletIcon._.icon, this.bulletIcon$);
    this.render($.detailsLabel._.textContent, this.detailsButtonLabel$);
    this.render($.detailsDrawer._.expanded, this.detailsDrawerExpanded$);
    this.addSetup(this.onDetailsButtonClick$);
  }

  @cache()
  private get bulletIcon$(): Observable<string> {
    return this.isDrawerExpanded$.pipe(
        map(isExpanded => isExpanded ? 'chevrondown' : 'chevronup'),
    );
  }

  @cache()
  private get detailsButtonLabel$(): Observable<string> {
    return this.declareInput($.host._.label).pipe(map(label => `Details: ${label}`));
  }

  @cache()
  private get detailsDrawerExpanded$(): Observable<boolean> {
    return this.isDrawerExpanded$;
  }

  @cache()
  private get onDetailsButtonClick$(): Observable<unknown> {
    return this.declareInput($.detailsButton._.actionEvent)
        .pipe(
            withLatestFrom(this.isDrawerExpanded$),
            tap(([, isExpanded]) => {
              this.isDrawerExpanded$.next(!isExpanded);
            }),
        );
  }
}
