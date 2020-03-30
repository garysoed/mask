import { attributeIn, attributeOut, booleanParser, dispatcher, element, mediaQuery, onDom, PersonaContext, stringParser } from 'persona';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, mapTo, startWith, takeUntil } from 'rxjs/operators';

import { $$ as $textIconButton, TextIconButton } from '../action/text-icon-button';
import { _p } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { $$ as $drawer, Drawer } from '../section/drawer';
import { MEDIA_QUERY } from '../theme/media-query';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import template from './root-layout.html';


export const $$ = {
  api: {
    drawerExpanded: attributeOut('drawer-expanded', booleanParser()),
    icon: attributeIn('icon', stringParser(), ''),
    label: attributeIn('label', stringParser(), ''),
    onTitleClick: dispatcher(ACTION_EVENT),
  },
  tag: 'mk-root-layout',
};

export const $ = {
  drawer: element('drawer', $drawer, {
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
  host: element($$.api),
  title: element('title', $textIconButton, {}),
};
export const $qIsDesktop = mediaQuery(`(min-width: ${MEDIA_QUERY.MIN_WIDTH.DESKTOP})`);

@_p.customElement({
  dependencies: [
    Drawer,
    TextIconButton,
  ],
  tag: $$.tag,
  template,
})
export class RootLayout extends ThemedCustomElementCtrl {
  private readonly hostIcon$ = this.declareInput($.host._.icon);
  private readonly hostLabel$ = this.declareInput($.host._.label);
  private readonly isDrawerOpen$ = this.declareSubject(() => new BehaviorSubject(false));
  private readonly onMouseOut$ = this.declareInput($.drawer._.onMouseOut);
  private readonly onMouseOver$ = this.declareInput($.drawer._.onMouseOver);
  private readonly onTitleClick$ = this.declareInput($.title._.actionEvent);
  private readonly qIsDesktop$ = this.declareInput($qIsDesktop);

  constructor(context: PersonaContext) {
    super(context);

    this.setupHandleDrawerExpandCollapse();
    this.render($.host._.drawerExpanded).withObservable(this.isDrawerOpen$);
    this.render($.drawer._.expanded).withObservable(this.isDrawerOpen$);
    this.render($.title._.label).withObservable(this.hostLabel$);
    this.render($.title._.icon).withObservable(this.hostIcon$);
    this.render($.host._.onTitleClick).withFunction(this.renderOnTitleClick);
  }

  private renderOnTitleClick(): Observable<ActionEvent> {
    return this.onTitleClick$.pipe(
        map(() => new ActionEvent()),
    );
  }

  private setupHandleDrawerExpandCollapse(): void {
    combineLatest([
        merge(
            this.onMouseOut$.pipe(debounceTime(100), mapTo(false)),
            this.onMouseOver$.pipe(debounceTime(100), mapTo(true)),
        )
        .pipe(
            startWith(false),
            distinctUntilChanged(),
        ),
        this.qIsDesktop$,
      ])
      .pipe(
          map(([mouseHover, isDesktop]) => mouseHover || isDesktop),
          takeUntil(this.onDispose$),
      )
      .subscribe(showDrawer => this.isDrawerOpen$.next(showDrawer));
  }
}
