import { $drawer, $textIconButton, _p, Drawer, TextIconButton, ThemedCustomElementCtrl } from 'export';
import { attributeIn, element, host, PersonaContext, stringParser } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import template from './demo-layout.html';

const $$ = {
  api: {
    label: attributeIn('label', stringParser()),
  },
  tag: 'mkd-demo-layout',
};

const $ = {
  detailsButton: element('detailsButton', $textIconButton, {}),
  detailsDrawer: element('detailsDrawer', $drawer, {}),
  host: host($$.api),
};

@_p.customElement({
  ...$$,
  dependencies: [
    Drawer,
    TextIconButton,
  ],
  template,
})
export class DemoLayout extends ThemedCustomElementCtrl {
  private readonly hostLabel$ = this.declareInput($.host._.label);
  private readonly isDrawerExpanded$ = new BehaviorSubject(false);
  private readonly onDetailsButtonClick$ = this.declareInput($.detailsButton._.actionEvent);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.detailsButton._.icon, this.renderDetailsButtonIcon());
    this.render($.detailsButton._.label, this.renderDetailsButtonLabel());
    this.render($.detailsDrawer._.expanded, this.renderDetailsDrawerExpanded());
    this.addSetup(this.setupOnDetailsButtonClick());
  }

  private renderDetailsButtonIcon(): Observable<string> {
    return this.isDrawerExpanded$.pipe(
        map(isExpanded => isExpanded ? 'chevrondown' : 'chevronup'),
    );
  }

  private renderDetailsButtonLabel(): Observable<string> {
    return this.hostLabel$.pipe(map(label => `Details: ${label}`));
  }

  private renderDetailsDrawerExpanded(): Observable<boolean> {
    return this.isDrawerExpanded$;
  }

  private setupOnDetailsButtonClick(): Observable<unknown> {
    return this.onDetailsButtonClick$
        .pipe(
            withLatestFrom(this.isDrawerExpanded$),
            tap(([, isExpanded]) => {
              this.isDrawerExpanded$.next(!isExpanded);
            }),
        );
  }
}
