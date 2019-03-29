import { instanceSourceId } from '@grapevine/component';
import { $vine, VineImpl } from '@grapevine/main';
import { BooleanType, ElementWithTagType } from 'gs-types/export';
import { attributeIn, element, mediaQuery, onDom } from '@persona/input';
import { api } from '@persona/main';
import { attributeOut } from '@persona/output';
import { combineLatest, merge, Observable } from 'rxjs';
import { map, mapTo, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $$ as $textIconButton } from '../component/text-icon-button';
import { $$ as $drawer } from '../section/drawer';
import { MEDIA_QUERY } from '../theme/media-query';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
import template from './root-layout.html';

export const $$ = {
  drawerExpanded: attributeOut('drawer-expanded', booleanParser()),
  icon: attributeIn('icon', stringParser()),
  label: attributeIn('label', stringParser()),
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

const $isDrawerOpen = instanceSourceId('isDrawerOpen', BooleanType);
_v.builder.source($isDrawerOpen, false);

@_p.customElement({
  tag: 'mk-root-layout',
  template,
})
@_p.render($.drawer._.expanded).withForwarding($isDrawerOpen)
@_p.render($.host._.drawerExpanded).withForwarding($isDrawerOpen)
@_p.render($.title._.label).withForwarding($.host._.label)
@_p.render($.title._.icon).withForwarding($.host._.icon)
export class RootLayout extends ThemedCustomElementCtrl {
  @_p.onCreate()
  handleDrawerExpandCollapse(
      @_p.input($.drawer._.onMouseOut) onMouseOutObs: Observable<Event>,
      @_p.input($.drawer._.onMouseOver) onMouseOverObs: Observable<Event>,
      @_p.input($qIsDesktop) isDesktopObs: Observable<boolean>,
      @_v.vineIn($vine) vineObs: Observable<VineImpl>,
  ): Observable<unknown> {
    return combineLatest(
        merge(
            onMouseOutObs.pipe(mapTo(false)),
            onMouseOverObs.pipe(mapTo(true)),
        ).pipe(startWith(false)),
        isDesktopObs,
    )
    .pipe(
        map(([mouseHover, isDesktop]) => mouseHover || isDesktop),
        withLatestFrom(vineObs),
        tap(([showDrawer, vine]) => {
          vine.setValue($isDrawerOpen, showDrawer, this);
        }),
    );
  }
}
