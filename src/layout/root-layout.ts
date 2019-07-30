import { ElementWithTagType } from '@gs-types';
import { api, attributeIn, attributeOut, dispatcher, element, InitFn, mediaQuery, onDom } from '@persona';
import { BehaviorSubject, combineLatest, merge, Observable } from '@rxjs';
import { map, mapTo, startWith, tap } from '@rxjs/operators';

import { $$ as $textIconButton, TextIconButton } from '../action/text-icon-button';
import { _p, _v } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { $$ as $drawer, Drawer } from '../section/drawer';
import { MEDIA_QUERY } from '../theme/media-query';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';

import template from './root-layout.html';

export const $$ = {
  drawerExpanded: attributeOut('drawer-expanded', booleanParser()),
  icon: attributeIn('icon', stringParser()),
  label: attributeIn('label', stringParser()),
  onTitleClick: dispatcher(ACTION_EVENT),
};

export const $ = {
  drawer: element('drawer', ElementWithTagType('mk-drawer'), {
    ...api($drawer),
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
  host: element($$),
  title: element('title', ElementWithTagType('mk-text-icon-button'), api($textIconButton)),
};
export const $qIsDesktop = mediaQuery(`(min-width: ${MEDIA_QUERY.MIN_WIDTH.DESKTOP})`);

@_p.customElement({
  dependencies: [
    Drawer,
    TextIconButton,
  ],
  tag: 'mk-root-layout',
  template,
})
export class RootLayout extends ThemedCustomElementCtrl {
  private readonly hostIcon$ = _p.input($.host._.icon, this);
  private readonly hostLabel$ = _p.input($.host._.label, this);
  private readonly isDrawerOpen$ = _v.source(() => new BehaviorSubject(false), this).asSubject();
  private readonly onMouseOut$ = _p.input($.drawer._.onMouseOut, this);
  private readonly onMouseOver$ = _p.input($.drawer._.onMouseOver, this);
  private readonly onTitleClick$ = _p.input($.title._.actionEvent, this);
  private readonly qIsDesktop$ = _p.input($qIsDesktop, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.setupHandleDrawerExpandCollapse(),
      _p.render($.host._.drawerExpanded).withObservable(this.isDrawerOpen$),
      _p.render($.drawer._.expanded).withObservable(this.isDrawerOpen$),
      _p.render($.title._.label).withObservable(this.hostLabel$),
      _p.render($.title._.icon).withObservable(this.hostIcon$),
      _p.render($.host._.onTitleClick).withVine(_v.stream(this.renderOnTitleClick, this)),
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
              this.onMouseOut$.pipe(mapTo(false)),
              this.onMouseOver$.pipe(mapTo(true)),
          ).pipe(startWith(false)),
          this.qIsDesktop$,
        ])
        .pipe(
            map(([mouseHover, isDesktop]) => mouseHover || isDesktop),
            tap(showDrawer => this.isDrawerOpen$.next(showDrawer)),
        );
  }
}
