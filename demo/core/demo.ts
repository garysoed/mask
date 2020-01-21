import { $drawer, $textIconButton, _p, _v, ACTION_EVENT, Drawer, IconWithText, LayoutOverlay, RootLayout, ThemedCustomElementCtrl } from 'export';

import { Vine } from '@grapevine';
import { ArrayDiff, filterNonNull } from '@gs-tools/rxjs';
import { elementWithTagType } from '@gs-types';
import { api, element, InitFn, onDom, RenderSpec, repeated, SimpleElementRenderSpec, single } from '@persona';
import { merge, Observable, of as observableOf } from '@rxjs';
import { distinctUntilChanged, map, mapTo, switchMap, withLatestFrom } from '@rxjs/operators';

import { COMPONENT_SPECS } from './component-spec';
import template from './demo.html';
import { $locationService, Views } from './location-service';


const $ = {
  drawerRoot: element('drawerRoot', elementWithTagType('div'), {
    componentButtons: repeated('componentButtons'),
    onClick: onDom('click'),
  }),
  content: element('content', elementWithTagType('div'), {
    content: single('content'),
  }),
  rootLayout: element('rootLayout', elementWithTagType('mk-root-layout'), {
    onAction: onDom(ACTION_EVENT),
  }),
  settingsDrawer: element('settingsDrawer', elementWithTagType('mk-drawer'), {
    ...api($drawer),
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
};

const COMPONENT_DEPENDENCIES = COMPONENT_SPECS.map(({ctor}) => ctor);
const COMPONENT_PATH_ATTR = 'path';

@_p.customElement({
  dependencies: [
    ...COMPONENT_DEPENDENCIES,
    Drawer,
    IconWithText,
    LayoutOverlay,
    RootLayout,
  ],
  tag: 'mkd-demo',
  template,
})
export class Demo extends ThemedCustomElementCtrl {
  private readonly onDrawerRootClick$ = _p.input($.drawerRoot._.onClick, this);
  private readonly onRootLayoutAction$ = _p.input($.rootLayout._.onAction, this);
  private readonly onSettingsDrawerMouseOut$ = _p.input($.settingsDrawer._.onMouseOut, this);
  private readonly onSettingsDrawerMouseOver$ = _p.input($.settingsDrawer._.onMouseOver, this);

  getInitFunctions(): readonly InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.drawerRoot._.componentButtons)
          .withVine(_v.stream(this.renderComponentButtons, this)),
      _p.render($.content._.content).withVine(_v.stream(this.renderMainContent, this)),
      _p.render($.settingsDrawer._.expanded)
          .withVine(_v.stream(this.renderSettingsDrawerExpanded, this)),
      this.setupOnComponentButtonClick,
      this.setupOnRootLayoutAction,
    ];
  }

  private renderComponentButtons(): Observable<ArrayDiff<RenderSpec>> {
    const renderSpec = COMPONENT_SPECS.map(({name, path}) => {
      return new SimpleElementRenderSpec(
          'mk-text-icon-button',
          new Map([
            [$textIconButton.label.attrName, name],
            [COMPONENT_PATH_ATTR, `${path}`],
          ]),
      );
    });

    return observableOf({type: 'init', value: renderSpec});
  }

  private renderMainContent(vine: Vine): Observable<RenderSpec> {
    return $locationService.get(vine).pipe(
        switchMap(locationService => locationService.getLocation()),
        map(location => {
          return COMPONENT_SPECS.find(({path}) => path === location.type);
        }),
        map(spec => {
          if (!spec) {
            return new SimpleElementRenderSpec('div');
          }

          return new SimpleElementRenderSpec(spec.tag);
        }),
    );
  }

  private renderSettingsDrawerExpanded(): Observable<boolean> {
    return merge(
        this.onSettingsDrawerMouseOut$.pipe(mapTo(false)),
        this.onSettingsDrawerMouseOver$.pipe(mapTo(true)),
    )
    .pipe(
        distinctUntilChanged(),
    );
  }

  private setupOnComponentButtonClick(vine: Vine): Observable<unknown> {
    return this.onDrawerRootClick$.pipe(
        map(event => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) {
            return null;
          }

          return target.getAttribute(COMPONENT_PATH_ATTR) || null;
        }),
        filterNonNull(),
        withLatestFrom($locationService.get(vine)),
        switchMap(([path, locationService]) => locationService.goToPath(path, {})),
    );
  }

  private setupOnRootLayoutAction(vine: Vine): Observable<unknown> {
    return this.onRootLayoutAction$.pipe(
        withLatestFrom($locationService.get(vine)),
        switchMap(([, locationService]) => locationService.goToPath(Views.MAIN, {})),
    );
  }
}

