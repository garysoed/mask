import { ElementWithTagType } from '@gs-types';
import { attributeIn, element, mediaQuery, onDom } from '@persona/input';
import { attributeOut } from '@persona/output';
import { Vine } from 'grapevine/export';
import { InitFn } from 'persona/export';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { map, mapTo, startWith, tap } from 'rxjs/operators';
import { _p, _v } from '../app/app';
// import { $$ as $textIconButton } from '../component/text-icon-button';
// import { $$ as $drawer } from '../section/drawer';
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
    // ...api($drawer),
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
  host: element($$),
  root: element('root', ElementWithTagType('section'), {
    theme: attributeOut('mk-theme', stringParser()),
  }),
  // title: element('title', ElementWithTagType('mk-text-icon-button'), api($textIconButton)),
};
export const $qIsDesktop = mediaQuery(`(min-width: ${MEDIA_QUERY.MIN_WIDTH.DESKTOP})`);

const $isDrawerOpen = _v.source(() => new BehaviorSubject(false), globalThis);

@_p.customElement({
  tag: 'mk-root-layout',
  template,
})
// @_p.render($.drawer._.expanded).withForwarding($isDrawerOpen)
// @_p.render($.host._.drawerExpanded).withForwarding($isDrawerOpen)
// @_p.render($.title._.label).withForwarding($.host._.label)
// @_p.render($.title._.icon).withForwarding($.host._.icon)
export class RootLayout extends ThemedCustomElementCtrl {
  private readonly hostThemeObs = _p.input($.host._.theme, this);
  private readonly onMouseOutObs = _p.input($.drawer._.onMouseOut, this);
  private readonly onMouseOverObs = _p.input($.drawer._.onMouseOver, this);
  private readonly qIsDesktopObs = _p.input($qIsDesktop, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.setupHandleDrawerExpandCollapse,
      _p.render($.host._.drawerExpanded).with($isDrawerOpen),
      _p.render($.root._.theme).withObservable(this.hostThemeObs),
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
        tap(showDrawer => $isDrawerOpen.get(vine).next(showDrawer)),
    );
  }
}
