import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, booleanParser, dispatcher, element, host, mediaQuery, onDom, PersonaContext, stringParser, textContent } from 'persona';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, mapTo, startWith, tap } from 'rxjs/operators';

import { $button, Button } from '../action/button';
import { _p } from '../app/app';
import { $icon, Icon } from '../display/icon';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { $drawerLayout, DrawerLayout } from '../layout/drawer-layout';
import { MEDIA_QUERY } from '../theme/media-query';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import { ListItemLayout } from './list-item-layout';
import template from './root-layout.html';


export const $rootLayout = {
  api: {
    drawerExpanded: attributeOut('drawer-expanded', booleanParser()),
    icon: attributeIn('icon', stringParser(), ''),
    label: attributeIn('label', stringParser(), ''),
    onTitleClick: dispatcher(ACTION_EVENT),
  },
  tag: 'mk-root-layout',
};

export const $ = {
  drawer: element('drawer', $drawerLayout, {
    onMouseLeave: onDom('mouseleave'),
    onMouseEnter: onDom('mouseenter'),
  }),
  host: host($rootLayout.api),
  mainIcon: element('mainIcon', $icon, {}),
  title: element('title', instanceofType(HTMLParagraphElement), {
    textContent: textContent(),
  }),
  titleButton: element('titleButton', $button, {}),
};
export const $qIsDesktop = mediaQuery(`(min-width: ${MEDIA_QUERY.MIN_WIDTH.DESKTOP})`);

@_p.customElement({
  ...$rootLayout,
  dependencies: [
    Button,
    DrawerLayout,
    Icon,
    ListItemLayout,
  ],
  template,
})
export class RootLayout extends ThemedCustomElementCtrl {
  private readonly isDrawerOpen$ = new BehaviorSubject(false);

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupHandleDrawerExpandCollapse());
    this.render($.host._.drawerExpanded, this.isDrawerOpen$);
    this.render($.drawer._.expanded, this.isDrawerOpen$);
    this.render($.title._.textContent, this.declareInput($.host._.label));
    this.render($.mainIcon._.icon, this.declareInput($.host._.icon));
    this.render($.host._.onTitleClick, this.renderOnTitleClick());
  }

  private renderOnTitleClick(): Observable<ActionEvent<void>> {
    return this.declareInput($.titleButton._.actionEvent).pipe(
        map(() => new ActionEvent(undefined)),
    );
  }

  private setupHandleDrawerExpandCollapse(): Observable<unknown> {
    return combineLatest([
        merge(
            this.declareInput($.drawer._.onMouseLeave).pipe(mapTo(false)),
            this.declareInput($.drawer._.onMouseEnter).pipe(mapTo(true)),
        )
        .pipe(
            startWith(false),
            distinctUntilChanged(),
        ),
        this.declareInput($qIsDesktop),
      ])
      .pipe(
          map(([mouseHover, isDesktop]) => mouseHover || isDesktop),
          tap(showDrawer => this.isDrawerOpen$.next(showDrawer)),
      );
  }
}
