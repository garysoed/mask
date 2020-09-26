import { Vine } from 'grapevine';
import { Color } from 'gs-tools/export/color';
import { cache } from 'gs-tools/export/data';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { StateId } from 'gs-tools/export/state';
import { elementWithTagType, enumType, instanceofType } from 'gs-types';
import { attributeOut, element, multi, onDom, PersonaContext, renderCustomElement, renderElement, single, stringParser } from 'persona';
import { combineLatest, merge, Observable, of as observableOf } from 'rxjs';
import { distinctUntilChanged, map, mapTo, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { $button, Button } from '../../src/action/button';
import { $checkbox, Checkbox } from '../../src/action/input/checkbox';
import { _p } from '../../src/app/app';
import { $stateService } from '../../src/core/state-service';
import { ACTION_EVENT } from '../../src/event/action-event';
import { $lineLayout, LineLayout } from '../../src/layout/line-layout';
import { ListItemLayout } from '../../src/layout/list-item-layout';
import { $rootLayout, RootLayout } from '../../src/layout/root-layout';
import { LayoutOverlay } from '../../src/layout/util/layout-overlay';
import { $drawer, Drawer } from '../../src/section-old/drawer';
import { PALETTE, Palette } from '../../src/theme/palette';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';

import { $demoState } from './demo-state';
import template from './demo.html';
import { $locationService, Views } from './location-service';
import { ACTION_SPECS, ALL_SPECS, DISPLAY_SPECS, GENERAL_SPECS, getPageSpec, PageSpec } from './page-spec';


const $ = {
  accentPalette: element('accentPalette', elementWithTagType('div'), {
    content: multi('content'),
    onClick: onDom<MouseEvent>('click'),
  }),
  basePalette: element('basePalette', elementWithTagType('div'), {
    content: multi('content'),
    onClick: onDom<MouseEvent>('click'),
  }),
  content: element('content', elementWithTagType('div'), {
    content: single('content'),
  }),
  drawerRoot: element('drawerRoot', instanceofType(HTMLElement), {
    actionContents: multi('#actionContents'),
    displayContents: multi('#displayContents'),
    generalContents: multi('#generalContents'),
    onAction: onDom(ACTION_EVENT),
  }),
  darkMode: element('darkMode', $checkbox, {}),
  root: element('root', elementWithTagType('section'), {
    theme: attributeOut('mk-theme', stringParser()),
  }),
  rootLayout: element('rootLayout', $rootLayout, {
    onAction: onDom(ACTION_EVENT),
  }),
  settingsDrawer: element('settingsDrawer', $drawer, {
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
  }),
};

const PAGE_CTORS = ALL_SPECS.map(({ctor}) => ctor);
const COMPONENT_PATH_ATTR = 'path';

@_p.customElement({
  dependencies: [
    ...PAGE_CTORS,
    Button,
    Checkbox,
    Drawer,
    LayoutOverlay,
    LineLayout,
    ListItemLayout,
    RootLayout,
  ],
  tag: 'mkd-demo',
  template,
  api: {},
})
export class Demo extends ThemedCustomElementCtrl {
  // private readonly onDrawerRootClick$ = this.declareInput($.components._.onClick);
  private readonly onRootLayoutAction$ = this.declareInput($.rootLayout._.onAction);

  constructor(context: PersonaContext) {
    super(context);
    this.render($.accentPalette._.content, this.accentPaletteContents$);
    this.render($.basePalette._.content, this.basePaletteContents$);
    this.render($.darkMode._.stateId, this.darkModeStateId$);
    this.render($.content._.content, this.mainContent$);
    this.render($.drawerRoot._.actionContents, this.renderPageButtons(ACTION_SPECS));
    this.render($.drawerRoot._.displayContents, this.renderPageButtons(DISPLAY_SPECS));
    this.render($.drawerRoot._.generalContents, this.renderPageButtons(GENERAL_SPECS));
    this.render($.settingsDrawer._.expanded, this.renderSettingsDrawerExpanded());
    this.render($.root._.theme, this.renderRootTheme());
    this.addSetup(this.onAccentPaletteClick$);
    this.addSetup(this.onBasePaletteClick$);
    this.addSetup(this.onDrawerRootClick$);
    this.addSetup(this.setupOnRootLayoutAction(context.vine));
  }

  @cache()
  private get accentPaletteContents$(): Observable<readonly Node[]> {
    const selectedColor$ = combineLatest([
      $demoState.get(this.vine),
      $stateService.get(this.vine),
    ])
    .pipe(
        switchMap(([demoState, stateService]) => {
          if (!demoState) {
            return observableOf(null);
          }

          return stateService.get(demoState.$accentColorName);
        }),
    );
    const paletteNode$List = ORDERED_PALETTES
        .map(([colorName, color]) => {
          const isSelected$ = selectedColor$.pipe(map(selectedName => selectedName === colorName));
          return renderPaletteData(
              colorName,
              color,
              isSelected$,
              this.context,
          );
        });

    return paletteNode$List.length <= 0 ? observableOf([]) : combineLatest(paletteNode$List);
  }

  @cache()
  private get basePaletteContents$(): Observable<readonly Node[]> {
    const selectedColor$ = combineLatest([
      $demoState.get(this.vine),
      $stateService.get(this.vine),
    ])
    .pipe(
        switchMap(([demoState, stateService]) => {
          if (!demoState) {
            return observableOf(null);
          }

          return stateService.get(demoState.$baseColorName);
        }),
    );
    const paletteNode$List = ORDERED_PALETTES
        .map(([colorName, color]) => {
          const isSelected$ = selectedColor$.pipe(map(selectedName => selectedName === colorName));
          return renderPaletteData(
              colorName,
              color,
              isSelected$,
              this.context,
          );
        });

    return paletteNode$List.length <= 0 ? observableOf([]) : combineLatest(paletteNode$List);
  }

  @cache()
  private get darkModeStateId$(): Observable<StateId<boolean>> {
    return $demoState.get(this.vine).pipe(
        map(demoState => {
          if (!demoState) {
            return null;
          }

          return demoState.$isDarkMode;
        }),
        filterNonNull(),
    );
  }

  @cache()
  private get onDrawerRootClick$(): Observable<unknown> {
    return this.declareInput($.drawerRoot._.onAction).pipe(
        withLatestFrom($locationService.get(this.vine)),
        tap(([event, locationService]) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) {
            return;
          }

          const path = target.getAttribute(COMPONENT_PATH_ATTR) || null;
          if (!enumType<Views>(Views).check(path)) {
            return;
          }

          event.stopPropagation();
          locationService.goToPath(path, {});
        }),
    );
  }

  @cache()
  private get mainContent$(): Observable<Node|null> {
    return $locationService.get(this.vine).pipe(
        switchMap(locationService => locationService.getLocation()),
        map(location => getPageSpec(location.type)),
        switchMap(spec => {
          if (!spec) {
            return observableOf(null);
          }

          return renderCustomElement(spec.componentSpec, {}, this.context);
        }),
    );
  }

  private renderPageButtons(pageSpecs: readonly PageSpec[]): Observable<readonly Node[]> {
    const node$List = pageSpecs
        .map(({path, name}) => {
            return renderCustomElement(
                $button,
                {
                  attrs: new Map([[COMPONENT_PATH_ATTR, observableOf(`${path}`)]]),
                  children: renderCustomElement(
                      $lineLayout,
                      {
                        attrs: new Map([
                          ['mk-body-1', observableOf('')],
                        ]),
                        textContent: observableOf(name),
                      },
                      this.context,
                  )
                  .pipe(map(node => [node] || [])),
                  inputs: {
                    isSecondary: observableOf(true),
                  },
                },
                this.context,
            );
        });

    return node$List.length <= 0 ? observableOf([]) : combineLatest(node$List);
  }

  private renderRootTheme(): Observable<'light'|'dark'> {
    return combineLatest([$demoState.get(this.vine), $stateService.get(this.vine)]).pipe(
        switchMap(([demoState, stateService]) => {
          if (!demoState) {
            return observableOf(null);
          }

          return stateService.get(demoState.$isDarkMode);
        }),
        map(isDarkMode => isDarkMode ? 'dark' : 'light'),
    );
  }

  private renderSettingsDrawerExpanded(): Observable<boolean> {
    return merge(
        this.declareInput($.settingsDrawer._.onMouseLeave).pipe(mapTo(false)),
        this.declareInput($.settingsDrawer._.onMouseEnter).pipe(mapTo(true)),
    )
    .pipe(
        distinctUntilChanged(),
    );
  }

  @cache()
  private get onAccentPaletteClick$(): Observable<unknown> {
    return this.declareInput($.accentPalette._.onClick)
        .pipe(
            map(event => getColor(event)),
            filterNonNull(),
            withLatestFrom($demoState.get(this.vine), $stateService.get(this.vine)),
            tap(([color, demoState, stateService]) => {
              if (!demoState) {
                return;
              }

              stateService.set(demoState.$accentColorName, color);
            }),
        );
  }

  @cache()
  private get onBasePaletteClick$(): Observable<unknown> {
    return this.declareInput($.basePalette._.onClick)
        .pipe(
            map(event => getColor(event)),
            filterNonNull(),
            withLatestFrom($demoState.get(this.vine), $stateService.get(this.vine)),
            tap(([color, demoState, stateService]) => {
              if (!demoState) {
                return;
              }

              stateService.set(demoState.$baseColorName, color);
            }),
        );
  }

  private setupOnRootLayoutAction(vine: Vine): Observable<unknown> {
    return this.onRootLayoutAction$
        .pipe(
            withLatestFrom($locationService.get(vine)),
            tap(([, locationService]) => {
              locationService.goToPath(Views.MAIN, {});
            }),
        );
  }
}

const ORDERED_PALETTES: ReadonlyArray<[keyof Palette, Color]> = [
  ['RED', PALETTE.RED],
  ['ORANGE', PALETTE.ORANGE],
  ['AMBER', PALETTE.AMBER],
  ['YELLOW', PALETTE.YELLOW],
  ['LIME', PALETTE.LIME],
  ['GREEN', PALETTE.GREEN],
  ['TEAL', PALETTE.TEAL],
  ['CYAN', PALETTE.CYAN],
  ['AZURE', PALETTE.AZURE],
  ['BLUE', PALETTE.BLUE],
  ['VIOLET', PALETTE.VIOLET],
  ['PURPLE', PALETTE.PURPLE],
  ['MAGENTA', PALETTE.MAGENTA],
  ['PINK', PALETTE.PINK],
  ['BROWN', PALETTE.BROWN],
  ['GREY', PALETTE.GREY],
];

function renderPaletteData(
    colorName: string,
    color: Color,
    selected$: Observable<boolean>,
    context: PersonaContext,
): Observable<Node> {
  const colorCss = `rgb(${color.red}, ${color.green}, ${color.blue})`;

  const classes$ = selected$.pipe(
      map(selected => {
        return selected ? ['palette', 'selected'] : ['palette'];
      }),
      map(classes => classes.join(' ')),
  );

  return renderElement(
      'div',
      {
        attrs: new Map([
          ['class', classes$],
          ['color', observableOf(colorName)],
          ['style', observableOf(`background-color: ${colorCss};`)],
        ]),
      },
      context,
  );
}

function getColor(event: MouseEvent): keyof Palette|null {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const colorName = target.getAttribute('color');
  if (!colorName) {
    return null;
  }

  return colorName as keyof Palette;
}
