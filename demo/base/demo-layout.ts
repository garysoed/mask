import { $drawer, $textIconButton, _p, _v, Drawer, TextIconButton, ThemedCustomElementCtrl } from 'export';

import { elementWithTagType } from '@gs-types';
import { api, element, InitFn } from '@persona';
import { BehaviorSubject, Observable } from '@rxjs';
import { map, tap, withLatestFrom } from '@rxjs/operators';

import template from './demo-layout.html';

const $ = {
  detailsButton: element('detailsButton', elementWithTagType('mk-text-icon-button'), {
    ...api($textIconButton),
  }),
  detailsDrawer: element('detailsDrawer', elementWithTagType('mk-drawer'), {
    ...api($drawer),
  }),
};

@_p.customElement({
  dependencies: [
    Drawer,
    TextIconButton,
  ],
  tag: 'mkd-demo-layout',
  template,
})
export class DemoLayout extends ThemedCustomElementCtrl {
  private readonly isDrawerExpanded$ = new BehaviorSubject(false);
  private readonly onDetailsButtonClick$ = _p.input($.detailsButton._.actionEvent, this);

  getInitFunctions(): readonly InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.detailsButton._.icon).withVine(_v.stream(this.renderDetailsButtonIcon, this)),
      _p.render($.detailsDrawer._.expanded)
          .withVine(_v.stream(this.renderDetailsDrawerExpanded, this)),
      this.setupOnDetailsButtonClick,
    ];
  }

  private renderDetailsButtonIcon(): Observable<string> {
    return this.isDrawerExpanded$.pipe(
        map(isExpanded => isExpanded ? 'chevrondown' : 'chevronup'),
    );
  }

  private renderDetailsDrawerExpanded(): Observable<boolean> {
    return this.isDrawerExpanded$;
  }

  private setupOnDetailsButtonClick(): Observable<unknown> {
    return this.onDetailsButtonClick$.pipe(
        withLatestFrom(this.isDrawerExpanded$),
        tap(([, isExpanded]) => {
          this.isDrawerExpanded$.next(!isExpanded);
        }),
    );
  }
}
