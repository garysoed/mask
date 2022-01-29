import {Color} from 'gs-tools/export/color';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {enumType} from 'gs-types';
import {Context, Ctrl, DIV, id, ievent, oattr, omulti, osingle, registerCustomElement, renderCustomElement, renderElement, RenderSpec, SECTION} from 'persona';
import {combineLatest, merge, Observable, of} from 'rxjs';
import {distinctUntilChanged, map, mapTo, tap} from 'rxjs/operators';

import {BUTTON} from '../../src/action/button';
import {OVERLAY} from '../../src/core/overlay';
import {ActionEvent, ACTION_EVENT} from '../../src/event/action-event';
import {CHECKBOX} from '../../src/input/checkbox';
import {DRAWER_LAYOUT} from '../../src/layout/drawer-layout';
import {LINE_LAYOUT} from '../../src/layout/line-layout';
import {LIST_ITEM_LAYOUT} from '../../src/layout/list-item-layout';
import {ROOT_LAYOUT} from '../../src/layout/root-layout';
import {PALETTE, Palette} from '../../src/theme/palette';
import {renderTheme} from '../../src/theme/render-theme';

import {$demoState} from './demo-state';
import template from './demo.html';
import {$locationService, Views} from './location-service';
import {ACTION_SPECS, ALL_SPECS, DISPLAY_SPECS, GENERAL_SPECS, getPageSpec, LAYOUT_SPECS, PageSpec} from './page-spec';


const $demo = {
  host: {},
  shadow: {
    accentPalette: id('accentPalette', DIV, {
      content: omulti('#content'),
      onClick: ievent('click', MouseEvent),
    }),
    basePalette: id('basePalette', DIV, {
      content: omulti('#content'),
      onClick: ievent('click', MouseEvent),
    }),
    content: id('content', DIV, {
      content: osingle('#content'),
    }),
    drawerRoot: id('drawerRoot', DIV, {
      actionContents: omulti('#actionContents'),
      displayContents: omulti('#displayContents'),
      generalContents: omulti('#generalContents'),
      layoutContents: omulti('#layoutContents'),
      onAction: ievent(ACTION_EVENT, ActionEvent),
    }),
    darkMode: id('darkMode', CHECKBOX),
    root: id('root', SECTION, {
      theme: oattr('mk-theme'),
    }),
    rootLayout: id('rootLayout', ROOT_LAYOUT, {
      onAction: ievent(ACTION_EVENT, ActionEvent),
    }),
    settingsDrawer: id('settingsDrawer', DRAWER_LAYOUT, {
      onMouseEnter: ievent('mouseenter', MouseEvent),
      onMouseLeave: ievent('mouseleave', MouseEvent),
    }),
  },
};

const PAGE_REGISTRATIONS = ALL_SPECS.map(({registration}) => registration);
const COMPONENT_PATH_ATTR = 'path';

class DemoCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $demo>) {
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.onAccentPaletteClick$,
      this.onBasePaletteClick$,
      this.onDrawerRootClick$,
      this.setupOnRootLayoutAction(),
      this.accentPaletteContents$.pipe(this.$.shadow.accentPalette.content()),
      this.basePaletteContents$.pipe(this.$.shadow.basePalette.content()),
      this.$.shadow.darkMode.value.pipe(
          map(value => value === true),
          $demoState.get(this.$.vine).$('isDarkMode').set(),
      ),
      this.mainContent$.pipe(this.$.shadow.content.content()),
      this.renderPageButtons(ACTION_SPECS).pipe(this.$.shadow.drawerRoot.actionContents()),
      this.renderPageButtons(DISPLAY_SPECS).pipe(this.$.shadow.drawerRoot.displayContents()),
      this.renderPageButtons(GENERAL_SPECS).pipe(this.$.shadow.drawerRoot.generalContents()),
      this.renderPageButtons(LAYOUT_SPECS).pipe(this.$.shadow.drawerRoot.layoutContents()),
      this.isDrawerExpanded$.pipe(this.$.shadow.settingsDrawer.expanded()),
      this.rootTheme$.pipe(this.$.shadow.root.theme()),
    ];
  }

  @cache()
  private get accentPaletteContents$(): Observable<readonly RenderSpec[]> {
    const selectedColor$ = $demoState.get(this.$.vine).$('accentColorName');
    const paletteNode$List = ORDERED_PALETTES
        .map(([colorName, color]) => {
          const isSelected$ = selectedColor$.pipe(map(selectedName => selectedName === colorName));
          return renderPaletteData(
              colorName,
              color,
              isSelected$,
          );
        });

    return paletteNode$List.length <= 0 ? of([]) : combineLatest(paletteNode$List);
  }

  @cache()
  private get basePaletteContents$(): Observable<readonly RenderSpec[]> {
    const selectedColor$ = $demoState.get(this.$.vine).$('baseColorName');
    const paletteNode$List = ORDERED_PALETTES
        .map(([colorName, color]) => {
          const isSelected$ = selectedColor$.pipe(map(selectedName => selectedName === colorName));
          return renderPaletteData(
              colorName,
              color,
              isSelected$,
          );
        });

    return paletteNode$List.length <= 0 ? of([]) : combineLatest(paletteNode$List);
  }

  @cache()
  private get onDrawerRootClick$(): Observable<unknown> {
    return this.$.shadow.drawerRoot.onAction.pipe(
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
          $locationService.get(this.$.vine).goToPath(path, {});
        }),
    );
  }

  @cache()
  private get mainContent$(): Observable<RenderSpec|null> {
    return $locationService.get(this.$.vine).location$.pipe(
        map(location => getPageSpec(location.type)),
        map(spec => {
          if (!spec) {
            return null;
          }

          return renderCustomElement({
            registration: spec.registration,
            inputs: {},
            id: {},
          });
        }),
    );
  }

  private renderPageButtons(pageSpecs: readonly PageSpec[]): Observable<readonly RenderSpec[]> {
    const node$List = pageSpecs
        .map(({path, name}) => {
          return renderCustomElement({
            registration: BUTTON,
            attrs: new Map([[COMPONENT_PATH_ATTR, of(`${path}`)]]),
            children: of([
              renderCustomElement({
                registration: LINE_LAYOUT,
                attrs: new Map([['mk-body-1', of('')]]),
                textContent: of(name),
                inputs: {},
                id: name,
              }),
            ]),
            inputs: {
              isSecondary: of(true),
            },
            id: name,
          });
        });

    return of(node$List);
  }

  @cache()
  private get rootTheme$(): Observable<'light'|'dark'> {
    return $demoState.get(this.$.vine).$('isDarkMode').pipe(
        map(isDarkMode => isDarkMode ? 'dark' : 'light'),
    );
  }

  @cache()
  private get isDrawerExpanded$(): Observable<boolean> {
    return merge(
        this.$.shadow.settingsDrawer.onMouseLeave.pipe(mapTo(false)),
        this.$.shadow.settingsDrawer.onMouseEnter.pipe(mapTo(true)),
    )
        .pipe(
            distinctUntilChanged(),
        );
  }

  @cache()
  private get onAccentPaletteClick$(): Observable<unknown> {
    return this.$.shadow.accentPalette.onClick
        .pipe(
            map(event => getColor(event)),
            filterNonNullable(),
            $demoState.get(this.$.vine).$('accentColorName').set(),
        );
  }

  @cache()
  private get onBasePaletteClick$(): Observable<unknown> {
    return this.$.shadow.basePalette.onClick
        .pipe(
            map(event => getColor(event)),
            filterNonNullable(),
            $demoState.get(this.$.vine).$('baseColorName').set(),
        );
  }

  private setupOnRootLayoutAction(): Observable<unknown> {
    return this.$.shadow.rootLayout.onAction
        .pipe(
            tap(() => {
              $locationService.get(this.$.vine).goToPath(Views.MAIN, {});
            }),
        );
  }
}
export const DEMO = registerCustomElement({
  deps: [
    ...PAGE_REGISTRATIONS,
    BUTTON,
    CHECKBOX,
    DRAWER_LAYOUT,
    OVERLAY,
    // LayoutOverlay,
    LINE_LAYOUT,
    LIST_ITEM_LAYOUT,
    ROOT_LAYOUT,
  ],
  tag: 'mkd-demo',
  template,
  ctrl: DemoCtrl,
  spec: $demo,
});


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

  return of(renderElement({
    tag: 'div',
    attrs: new Map<string, Observable<string>>([
      ['class', classes$],
      ['color', of(colorName)],
      ['style', of(`background-color: ${colorCss};`)],
    ]),
    id: colorName,
  }));
}

function getColor(event: Event): keyof Palette|null {
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
