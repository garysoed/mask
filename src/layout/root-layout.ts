import {cache} from 'gs-tools/export/data';
import {$p, attributeIn, attributeOut, booleanParser, dispatcher, element, host, mediaQuery, onDom, PersonaContext, stringParser, textContent} from 'persona';
import {combineLatest, merge, Observable} from 'rxjs';
import {distinctUntilChanged, map, mapTo, startWith} from 'rxjs/operators';

import {$button, Button} from '../action/button';
import {_p} from '../app/app';
import {$icon, Icon} from '../display/icon';
import {ActionEvent, ACTION_EVENT} from '../event/action-event';
import {$drawerLayout, DrawerLayout} from '../layout/drawer-layout';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';
import {MEDIA_QUERY} from '../theme/media-query';

import {ListItemLayout} from './list-item-layout';
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
  title: element('title', $p, {
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
export class RootLayout extends BaseThemedCtrl<typeof $> {

  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.host.drawerExpanded(this.isDrawerOpen$),
      this.renderers.host.onTitleClick(this.onTitleClick$()),
      this.renderers.drawer.expanded(this.isDrawerOpen$),
      this.renderers.title.textContent(this.inputs.host.label),
      this.renderers.mainIcon.icon(this.inputs.host.icon),
    ];
  }

  @cache()
  private onTitleClick$(): Observable<ActionEvent<void>> {
    return this.inputs.titleButton.actionEvent.pipe(
        map(() => new ActionEvent(undefined)),
    );
  }

  @cache()
  private get isDrawerOpen$(): Observable<boolean> {
    return combineLatest([
      merge(
          this.inputs.drawer.onMouseLeave.pipe(mapTo(false)),
          this.inputs.drawer.onMouseEnter.pipe(mapTo(true)),
      )
          .pipe(
              startWith(false),
              distinctUntilChanged(),
          ),
      $qIsDesktop.getValue(),
    ])
        .pipe(
            map(([mouseHover, isDesktop]) => mouseHover || isDesktop),
        );
  }
}
