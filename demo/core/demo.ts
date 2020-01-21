import { $textIconButton, _p, _v, RootLayout, ThemedCustomElementCtrl } from 'export';

import { Vine } from '@grapevine';
import { ArrayDiff, filterNonNull } from '@gs-tools/rxjs';
import { elementWithTagType } from '@gs-types';
import { element, InitFn, onDom, RenderSpec, repeated, SimpleElementRenderSpec } from '@persona';
import { Observable, of as observableOf } from '@rxjs';
import { map, switchMap, withLatestFrom } from '@rxjs/operators';

import { COMPONENT_SPECS } from './component-spec';
import template from './demo.html';
import { $locationService } from './location-service';


const $ = {
  drawerRoot: element('drawerRoot', elementWithTagType('div'), {
    componentButtons: repeated('componentButtons'),
    onClick: onDom('click'),
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
  private readonly locationService$ = $locationService;
  private readonly onDrawerRootClick$ = _p.input($.drawerRoot._.onClick, this);

  getInitFunctions(): readonly InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.drawerRoot._.componentButtons)
          .withVine(_v.stream(this.renderComponentButtons, this)),
      this.setupOnComponentButtonClick,
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
        withLatestFrom(this.locationService$.get(vine)),
        switchMap(([path, locationService]) => locationService.goToPath(path, {})),
    );
  }
}

