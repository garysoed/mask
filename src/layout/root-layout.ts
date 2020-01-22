import { attributeIn, attributeOut, dispatcher, element, InitFn, mediaQuery, onDom } from '@persona';
import { BehaviorSubject, combineLatest, merge, Observable } from '@rxjs';
import { debounceTime, distinctUntilChanged, map, mapTo, startWith, tap } from '@rxjs/operators';

import { $$ as $textIconButton, TextIconButton } from '../action/text-icon-button';
import { _p, _v } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { $$ as $drawer, Drawer } from '../section/drawer';
import { MEDIA_QUERY } from '../theme/media-query';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';

import template from './root-layout.html';


export const $$ = {
  api: {
    drawerExpanded: attributeOut('drawer-expanded', booleanParser()),
    icon: attributeIn('icon', stringParser()),
    label: attributeIn('label', stringParser()),
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
  private readonly isDrawerOpen$ = _v.source(() => new BehaviorSubject(false), this).asSubject();
  private readonly onMouseOut$ = this.declareInput($.drawer._.onMouseOut);
  private readonly onMouseOver$ = this.declareInput($.drawer._.onMouseOver);
  private readonly onTitleClick$ = this.declareInput($.title._.actionEvent);
  private readonly qIsDesktop$ = this.declareInput($qIsDesktop);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.setupHandleDrawerExpandCollapse(),
      _p.render($.host._.drawerExpanded).withObservable(this.isDrawerOpen$),
      _p.render($.drawer._.expanded).withObservable(this.isDrawerOpen$),
      _p.render($.title._.label).withObservable(this.hostLabel$),
      _p.render($.title._.icon).withObservable(this.hostIcon$),
      this.renderStream($.host._.onTitleClick, this.renderOnTitleClick),
    ];
  }

  private renderOnTitleClick(): Observable<ActionEvent> {
    return this.onTitleClick$.pipe(
        map(() => new ActionEvent()),
    );
  }

  private setupHandleDrawerExpandCollapse(): InitFn {
    return () => combineLatest([
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
            tap(showDrawer => this.isDrawerOpen$.next(showDrawer)),
        );
  }
}
