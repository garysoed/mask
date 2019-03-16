import { instanceSourceId } from 'grapevine/export/component';
import { $vine, VineImpl } from 'grapevine/export/main';
import { debug } from 'gs-tools/export/rxjs';
import { BooleanType, ElementWithTagType } from 'gs-types/export';
import { element, mediaQuery, onDom } from 'persona/export/input';
import { attributeOut } from 'persona/export/output';
import { combineLatest, merge, Observable } from 'rxjs';
import { map, mapTo, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { MEDIA_QUERY } from '../theme/media-query';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser } from '../util/parsers';
import template from './root-layout.html';

export const $ = {
  drawer: element('drawer', ElementWithTagType('mk-drawer'), {
    expanded: attributeOut('expanded', booleanParser()),
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
  host: element({
    drawerExpanded: attributeOut('drawer-expanded', booleanParser()),
  }),
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
