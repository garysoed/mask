import { ElementWithTagType } from '@gs-types';
import { attributeIn, element, mediaQuery, onDom } from '@persona/input';
import { api } from '@persona/main';
import { attributeOut } from '@persona/output';
import { Vine } from 'grapevine/export';
import { InitFn } from 'persona/export';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { map, mapTo, startWith, tap } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $$ as $textIconButton, TextIconButton } from '../component/text-icon-button';
import { $$ as $drawer, Drawer } from '../section/drawer';
import { MEDIA_QUERY } from '../theme/media-query';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
import template from './root-layout.html';

export const $$ = {
  drawerExpanded: attributeOut('drawer-expanded', booleanParser()),
  icon: attributeIn('icon', stringParser()),
  label: attributeIn('label', stringParser()),
  theme: attributeIn('theme', stringParser()),
};

export const $ = {
  drawer: element('drawer', ElementWithTagType('mk-drawer'), {
    ...api($drawer),
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
  host: element($$),
  root: element('root', ElementWithTagType('section'), {
    theme: attributeOut('mk-theme', stringParser()),
  }),
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
  private readonly hostIconObs = _p.input($.host._.icon, this);
  private readonly hostLabelObs = _p.input($.host._.label, this);
  private readonly hostThemeObs = _p.input($.host._.theme, this);
  private readonly isDrawerOpenSbj = _v.source(() => new BehaviorSubject(false), this).asSubject();
  private readonly onMouseOutObs = _p.input($.drawer._.onMouseOut, this);
  private readonly onMouseOverObs = _p.input($.drawer._.onMouseOver, this);
  private readonly qIsDesktopObs = _p.input($qIsDesktop, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.setupHandleDrawerExpandCollapse,
      _p.render($.host._.drawerExpanded).withObservable(this.isDrawerOpenSbj),
      _p.render($.root._.theme).withObservable(this.hostThemeObs),
      _p.render($.drawer._.expanded).withObservable(this.isDrawerOpenSbj),
      _p.render($.title._.label).withObservable(this.hostLabelObs),
      _p.render($.title._.icon).withObservable(this.hostIconObs),
    ];
  }

  private setupHandleDrawerExpandCollapse(vine: Vine): Observable<unknown> {
    return combineLatest(
        merge(
            this.onMouseOutObs.pipe(mapTo(false)),
            this.onMouseOverObs.pipe(mapTo(true)),
        ).pipe(startWith(false)),
        this.qIsDesktopObs,
    )
    .pipe(
        map(([mouseHover, isDesktop]) => mouseHover || isDesktop),
        tap(showDrawer => this.isDrawerOpenSbj.next(showDrawer)),
    );
  }
}
