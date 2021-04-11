import {Color} from 'gs-tools/export/color';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {elementWithTagType, enumType, instanceofType} from 'gs-types';
import {attributeOut, element, multi, onDom, PersonaContext, renderCustomElement, renderElement, RenderSpec, single, stringParser} from 'persona';
import {combineLatest, merge, Observable, of as observableOf} from 'rxjs';
import {distinctUntilChanged, map, mapTo, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {$button, Button} from '../../src/action/button';
import {$checkbox, Checkbox} from '../../src/action/input/checkbox';
import {_p} from '../../src/app/app';
import {Overlay} from '../../src/core/overlay';
import {$stateService} from '../../src/core/state-service';
import {ACTION_EVENT} from '../../src/event/action-event';
import {$drawerLayout, DrawerLayout} from '../../src/layout/drawer-layout';
import {$lineLayout, LineLayout} from '../../src/layout/line-layout';
import {ListItemLayout} from '../../src/layout/list-item-layout';
import {$rootLayout, RootLayout} from '../../src/layout/root-layout';
import {LayoutOverlay} from '../../src/layout/util/layout-overlay';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {PALETTE, Palette} from '../../src/theme/palette';

import {$demoState} from './demo-state';
import template from './demo.html';
import {$locationService, Views} from './location-service';
import {ACTION_SPECS, ALL_SPECS, DISPLAY_SPECS, GENERAL_SPECS, getPageSpec, LAYOUT_SPECS, PageSpec} from './page-spec';


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
    layoutContents: multi('#layoutContents'),
    onAction: onDom(ACTION_EVENT),
  }),
  darkMode: element('darkMode', $checkbox, {}),
  root: element('root', elementWithTagType('section'), {
    theme: attributeOut('mk-theme', stringParser()),
  }),
  rootLayout: element('rootLayout', $rootLayout, {
    onAction: onDom(ACTION_EVENT),
  }),
  settingsDrawer: element('settingsDrawer', $drawerLayout, {
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
    DrawerLayout,
    Overlay,
    LayoutOverlay,
    LineLayout,
    ListItemLayout,
    RootLayout,
  ],
  tag: 'mkd-demo',
  template,
  api: {},
})
export class Demo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(this.onAccentPaletteClick$);
    this.addSetup(this.onBasePaletteClick$);
    this.addSetup(this.onDrawerRootClick$);
    this.addSetup(this.setupOnRootLayoutAction());
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.accentPalette.content(this.accentPaletteContents$),
      this.renderers.basePalette.content(this.basePaletteContents$),
      this.renderers.darkMode.stateId(this.darkModeStateId$),
      this.renderers.content.content(this.mainContent$),
      this.renderers.drawerRoot.actionContents(this.renderPageButtons(ACTION_SPECS)),
      this.renderers.drawerRoot.displayContents(this.renderPageButtons(DISPLAY_SPECS)),
      this.renderers.drawerRoot.generalContents(this.renderPageButtons(GENERAL_SPECS)),
      this.renderers.drawerRoot.layoutContents(this.renderPageButtons(LAYOUT_SPECS)),
      this.renderers.settingsDrawer.expanded(this.renderSettingsDrawerExpanded()),
      this.renderers.root.theme(this.renderRootTheme()),
    ];
  }

  @cache()
  private get accentPaletteContents$(): Observable<readonly RenderSpec[]> {
    const selectedColor$ = $demoState.get(this.vine)
        .pipe(
            switchMap(demoState => {
              if (!demoState) {
                return observableOf(undefined);
              }

              return $stateService.get(this.vine).resolve(demoState.$accentColorName);
            }),
        );
    const paletteNode$List = ORDERED_PALETTES
        .map(([colorName, color]) => {
          const isSelected$ = selectedColor$.pipe(map(selectedName => selectedName === colorName));
          return renderPaletteData(
              colorName,
              color,
              isSelected$,
          );
        });

    return paletteNode$List.length <= 0 ? observableOf([]) : combineLatest(paletteNode$List);
  }

  @cache()
  private get basePaletteContents$(): Observable<readonly RenderSpec[]> {
    const selectedColor$ = $demoState.get(this.vine)
        .pipe(
            switchMap(demoState => {
              if (!demoState) {
                return observableOf(undefined);
              }

              return $stateService.get(this.vine).resolve(demoState.$baseColorName);
            }),
        );
    const paletteNode$List = ORDERED_PALETTES
        .map(([colorName, color]) => {
          const isSelected$ = selectedColor$.pipe(map(selectedName => selectedName === colorName));
          return renderPaletteData(
              colorName,
              color,
              isSelected$,
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
        filterNonNullable(),
    );
  }

  @cache()
  private get onDrawerRootClick$(): Observable<unknown> {
    return this.inputs.drawerRoot.onAction.pipe(
        tap(event => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) {
            return;
          }

          const path = target.getAttribute(COMPONENT_PATH_ATTR) || null;
          if (!enumType<Views>(Views).check(path)) {
            return;
          }

          event.stopPropagation();
          $locationService.get(this.vine).goToPath(path, {});
        }),
    );
  }

  @cache()
  private get mainContent$(): Observable<RenderSpec|null> {
    return $locationService.get(this.vine).getLocation().pipe(
        map(location => getPageSpec(location.type)),
        map(spec => {
          if (!spec) {
            return null;
          }

          return renderCustomElement({
            spec: spec.componentSpec,
            id: {},
          });
        }),
    );
  }

  private renderPageButtons(pageSpecs: readonly PageSpec[]): Observable<readonly RenderSpec[]> {
    const node$List = pageSpecs
        .map(({path, name}) => {
          return renderCustomElement({
            spec: $button,
            attrs: new Map([[COMPONENT_PATH_ATTR, `${path}`]]),
            children: [renderCustomElement({
              spec: $lineLayout,
              attrs: new Map([['mk-body-1', '']]),
              textContent: name,
              id: name,
            })],
            inputs: {
              isSecondary: observableOf(true),
            },
            id: name,
          });
        });

    return observableOf(node$List);
  }

  private renderRootTheme(): Observable<'light'|'dark'> {
    return $demoState.get(this.vine).pipe(
        switchMap(demoState => {
          if (!demoState) {
            return observableOf(undefined);
          }

          return $stateService.get(this.vine).resolve(demoState.$isDarkMode);
        }),
        map(isDarkMode => isDarkMode ? 'dark' : 'light'),
    );
  }

  private renderSettingsDrawerExpanded(): Observable<boolean> {
    return merge(
        this.inputs.settingsDrawer.onMouseLeave.pipe(mapTo(false)),
        this.inputs.settingsDrawer.onMouseEnter.pipe(mapTo(true)),
    )
        .pipe(
            distinctUntilChanged(),
        );
  }

  @cache()
  private get onAccentPaletteClick$(): Observable<unknown> {
    return this.inputs.accentPalette.onClick
        .pipe(
            map(event => getColor(event)),
            filterNonNullable(),
            withLatestFrom($demoState.get(this.vine)),
            $stateService.get(this.vine).modifyOperator((x, [color, demoState]) => {
              if (!demoState) {
                return;
              }

              x.set(demoState.$accentColorName, color);
            }),
        );
  }

  @cache()
  private get onBasePaletteClick$(): Observable<unknown> {
    return this.inputs.basePalette.onClick
        .pipe(
            map(event => getColor(event)),
            filterNonNullable(),
            withLatestFrom($demoState.get(this.vine)),
            $stateService.get(this.vine).modifyOperator((x, [color, demoState]) => {
              if (!demoState) {
                return;
              }

              x.set(demoState.$baseColorName, color);
            }),
        );
  }

  private setupOnRootLayoutAction(): Observable<unknown> {
    return this.inputs.rootLayout.onAction
        .pipe(
            tap(() => {
              $locationService.get(this.vine).goToPath(Views.MAIN, {});
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
): Observable<RenderSpec> {
  const colorCss = `rgb(${color.red}, ${color.green}, ${color.blue})`;

  const classes$ = selected$.pipe(
      map(selected => {
        return selected ? ['palette', 'selected'] : ['palette'];
      }),
      map(classes => classes.join(' ')),
  );

  return observableOf(renderElement({
    tag: 'div',
    attrs: new Map<string, string|Observable<string>>([
      ['class', classes$],
      ['color', colorName],
      ['style', `background-color: ${colorCss};`],
    ]),
    id: colorName,
  }));
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
