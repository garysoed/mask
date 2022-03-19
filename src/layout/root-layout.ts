import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {Context, Ctrl, ELEMENT, iattr, ievent, mediaQueryObservable, oevent, otext, query, registerCustomElement} from 'persona';
import {oflag} from 'persona/src/output/flag';
import {combineLatest, merge, Observable} from 'rxjs';
import {distinctUntilChanged, map, mapTo, startWith} from 'rxjs/operators';

import {BUTTON} from '../action/button';
import {ICON} from '../display/icon';
import {ActionEvent, ACTION_EVENT} from '../event/action-event';
import {MEDIA_QUERY} from '../theme/media-query';
import {renderTheme} from '../theme/render-theme';

import {DRAWER_LAYOUT} from './drawer-layout';
import {LIST_ITEM_LAYOUT} from './list-item-layout';
import template from './root-layout.html';


const $rootLayout = {
  host: {
    drawerExpanded: oflag('drawer-expanded'),
    icon: iattr('icon'),
    label: iattr('label'),
    onTitleClick: oevent(ACTION_EVENT, ActionEvent),
  },
  shadow: {
    drawer: query('#drawer', DRAWER_LAYOUT, {
      onMouseLeave: ievent('mouseleave', MouseEvent),
      onMouseEnter: ievent('mouseenter', MouseEvent),
    }),
    mainIcon: query('#mainIcon', ICON),
    title: query('#title', ELEMENT, {
      textContent: otext(),
    }),
    titleButton: query('#titleButton', BUTTON),
  },
};
const DESKTOP_QUERY = `(min-width: ${MEDIA_QUERY.MIN_WIDTH.DESKTOP})`;


class RootLayout implements Ctrl {
  constructor(private readonly $: Context<typeof $rootLayout>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.isDrawerOpen$.pipe(this.$.host.drawerExpanded()),
      this.onTitleClick$.pipe(this.$.host.onTitleClick()),
      this.isDrawerOpen$.pipe(this.$.shadow.drawer.expanded()),
      this.$.host.label.pipe(mapNullableTo(''), this.$.shadow.title.textContent()),
      this.$.host.icon.pipe(this.$.shadow.mainIcon.icon()),
    ];
  }

  @cache()
  private get onTitleClick$(): Observable<ActionEvent<void>> {
    return this.$.shadow.titleButton.actionEvent.pipe(
        map(() => new ActionEvent(undefined)),
    );
  }

  @cache()
  private get isDrawerOpen$(): Observable<boolean> {
    return combineLatest([
      merge(
          this.$.shadow.drawer.onMouseLeave.pipe(mapTo(false)),
          this.$.shadow.drawer.onMouseEnter.pipe(mapTo(true)),
      )
          .pipe(
              startWith(false),
              distinctUntilChanged(),
          ),
      mediaQueryObservable(DESKTOP_QUERY),
    ])
        .pipe(
            map(([mouseHover, isDesktop]) => mouseHover || isDesktop),
        );
  }
}

export const ROOT_LAYOUT = registerCustomElement({
  ctrl: RootLayout,
  deps: [
    BUTTON,
    DRAWER_LAYOUT,
    ICON,
    LIST_ITEM_LAYOUT,
  ],
  spec: $rootLayout,
  tag: 'mk-root-layout',
  template,
});