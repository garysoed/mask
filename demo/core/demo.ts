import { $textIconButton, _p, _v, ACTION_EVENT, RootLayout, ThemedCustomElementCtrl } from 'export';

import { Vine } from '@grapevine';
import { ArrayDiff, filterNonNull } from '@gs-tools/rxjs';
import { elementWithTagType } from '@gs-types';
import { element, InitFn, onDom, RenderSpec, repeated, SimpleElementRenderSpec, single } from '@persona';
import { Observable, of as observableOf } from '@rxjs';
import { map, switchMap, withLatestFrom } from '@rxjs/operators';

import { COMPONENT_SPECS } from './component-spec';
import template from './demo.html';
import { $locationService, Views } from './location-service';


const $ = {
  drawerRoot: element('drawerRoot', elementWithTagType('div'), {
    componentButtons: repeated('componentButtons'),
    onClick: onDom('click'),
  }),
  main: element('main', elementWithTagType('div'), {
    content: single('content'),
  }),
  rootLayout: element('rootLayout', elementWithTagType('mk-root-layout'), {
    onAction: onDom(ACTION_EVENT),
  }),
};

const COMPONENT_DEPENDENCIES = COMPONENT_SPECS.map(({ctor}) => ctor);
const COMPONENT_PATH_ATTR = 'path';

@_p.customElement({
  dependencies: [
    ...COMPONENT_DEPENDENCIES,
    RootLayout,
  ],
  tag: 'mkd-demo',
  template,
})
export class Demo extends ThemedCustomElementCtrl {
  private readonly onDrawerRootClick$ = _p.input($.drawerRoot._.onClick, this);
  private readonly onRootLayoutAction$ = _p.input($.rootLayout._.onAction, this);

  getInitFunctions(): readonly InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.drawerRoot._.componentButtons)
          .withVine(_v.stream(this.renderComponentButtons, this)),
      _p.render($.main._.content).withVine(_v.stream(this.renderMainContent, this)),
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

