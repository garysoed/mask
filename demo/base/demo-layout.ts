import { $drawer, $textIconButton, _p, Drawer, TextIconButton, ThemedCustomElementCtrl } from 'export';
import { Vine } from 'grapevine';
import { attributeIn, element, PersonaContext, stringParser } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import template from './demo-layout.html';


const $ = {
  detailsButton: element('detailsButton', $textIconButton, {}),
  detailsDrawer: element('detailsDrawer', $drawer, {}),
  host: element({
    label: attributeIn('label', stringParser()),
  }),
};

@_p.customElement({
  dependencies: [
    Drawer,
    TextIconButton,
  ],
  tag: 'mkd-demo-layout',
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
    this.setupOnDetailsButtonClick();
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

  private setupOnDetailsButtonClick(): void {
    this.onDetailsButtonClick$
        .pipe(
            withLatestFrom(this.isDrawerExpanded$),
        )
        .subscribe(([, isExpanded]) => {
          this.isDrawerExpanded$.next(!isExpanded);
        });
  }
}
