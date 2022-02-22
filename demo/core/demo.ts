import {Color} from 'gs-tools/export/color';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {enumType, hasPropertiesType, instanceofType, nullableType, stringType} from 'gs-types';
import {Context, Ctrl, DIV, id, ievent, itarget, oattr, ocase, oforeach, otext, query, registerCustomElement, renderCustomElement, renderElement, RenderSpec, renderTemplate, SPAN, TEMPLATE} from 'persona';
import {merge, Observable, of} from 'rxjs';
import {distinctUntilChanged, map, mapTo, tap} from 'rxjs/operators';

import {BUTTON} from '../../src/action/button';
import {OVERLAY} from '../../src/core/overlay';
import {ActionEvent, ACTION_EVENT} from '../../src/event/action-event';
import {CHECKBOX} from '../../src/input/checkbox';
import {DRAWER_LAYOUT} from '../../src/layout/drawer-layout';
import {LINE_LAYOUT} from '../../src/layout/line-layout';
import {LIST_ITEM_LAYOUT} from '../../src/layout/list-item-layout';
import {ROOT_LAYOUT} from '../../src/layout/root-layout';
import {renderTheme} from '../../src/theme/render-theme';
import {ThemeSeed, THEME_SEEDS} from '../../src/theme/theme-seed';

import {$demoState} from './demo-state';
import template from './demo.html';
import {$locationService, Views} from './location-service';
import {ACTION_SPECS, ALL_SPECS, DISPLAY_SPECS, GENERAL_SPECS, getPageSpec, LAYOUT_SPECS, PageSpec, PAGE_SPEC_TYPE} from './page-spec';


interface PaletteEntry {
  readonly colorName: string;
  readonly color: Color;
  readonly isSelected$: Observable<boolean>;
}

const PALETTE_ENTRY_TYPE = hasPropertiesType<PaletteEntry>({
  colorName: stringType,
  color: instanceofType(Color),
  isSelected$: instanceofType<Observable<boolean>>(Observable),
});

const $demo = {
  host: {},
  shadow: {
    _pageButton: id('_pageButton', TEMPLATE, {
      target: itarget(),
    }),
    accentPalette: id('accentPalette', DIV, {
      content: oforeach('#content', PALETTE_ENTRY_TYPE),
      onClick: ievent('click', MouseEvent),
    }),
    basePalette: id('basePalette', DIV, {
      content: oforeach('#content', PALETTE_ENTRY_TYPE),
      onClick: ievent('click', MouseEvent),
    }),
    content: id('content', DIV, {
      content: ocase('#content', nullableType(PAGE_SPEC_TYPE)),
    }),
    drawerRoot: id('drawerRoot', DIV, {
      actionContents: oforeach('#actionContents', PAGE_SPEC_TYPE),
      displayContents: oforeach('#displayContents', PAGE_SPEC_TYPE),
      generalContents: oforeach('#generalContents', PAGE_SPEC_TYPE),
      layoutContents: oforeach('#layoutContents', PAGE_SPEC_TYPE),
      onAction: ievent(ACTION_EVENT, ActionEvent),
    }),
    darkMode: id('darkMode', CHECKBOX),
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
      this.accentPaletteContents$.pipe(this.$.shadow.accentPalette.content(value => renderPaletteData(value))),
      this.basePaletteContents$.pipe(this.$.shadow.basePalette.content(value => renderPaletteData(value))),
      this.$.shadow.darkMode.value.pipe(
          map(value => value === true),
          $demoState.get(this.$.vine).$('isDarkMode').set(),
      ),
      $locationService.get(this.$.vine).location$.pipe(
          map(location => getPageSpec(location.type)),
          this.$.shadow.content.content(value => this.renderMainContent(value)),
      ),
      of(ACTION_SPECS).pipe(this.$.shadow.drawerRoot.actionContents(value => this.renderPageButtons(value))),
      of(DISPLAY_SPECS).pipe(this.$.shadow.drawerRoot.displayContents(value => this.renderPageButtons(value))),
      of(GENERAL_SPECS).pipe(this.$.shadow.drawerRoot.generalContents(value => this.renderPageButtons(value))),
      of(LAYOUT_SPECS).pipe(this.$.shadow.drawerRoot.layoutContents(value => this.renderPageButtons(value))),
      this.isDrawerExpanded$.pipe(this.$.shadow.settingsDrawer.expanded()),
    ];
  }

  @cache()
  private get accentPaletteContents$(): Observable<readonly PaletteEntry[]> {
    const paletteNodes = ORDERED_PALETTES
        .map(([colorName, color]) => {
          return {
            colorName,
            color,
            isSelected$: $demoState.get(this.$.vine).$('accentColorName')
                .pipe(map(selectedName => selectedName === colorName)),
          };
        });

    return of(paletteNodes);
  }

  @cache()
  private get basePaletteContents$(): Observable<readonly PaletteEntry[]> {
    const paletteNodes = ORDERED_PALETTES
        .map(([colorName, color]) => {
          return {
            colorName,
            color,
            isSelected$: $demoState.get(this.$.vine).$('baseColorName')
                .pipe(map(selectedName => selectedName === colorName)),
          };
        });

    return of(paletteNodes);
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

  private renderMainContent(spec: PageSpec|null): Observable<RenderSpec|null> {
    if (!spec) {
      return of(null);
    }

    return of(renderCustomElement({
      registration: spec.registration,
      inputs: {},
      id: {},
    }));
  }

  private renderPageButtons({path, name}: PageSpec): Observable<RenderSpec> {
    return of(renderTemplate({
      // TODO: Do not cast
      template$: this.$.shadow._pageButton.target as Observable<HTMLTemplateElement>,
      spec: {
        button: query('mk-button', BUTTON, {
          path: oattr(COMPONENT_PATH_ATTR),
        }),
        div: query('span', SPAN, {
          text: otext(),
        }),
      },
      runs: $ => [
        of(path).pipe($.button.path()),
        of(name).pipe($.div.text()),
      ],
      id: name,
    }));
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


const ORDERED_PALETTES: ReadonlyArray<[keyof ThemeSeed, Color]> = [
  ['RED', THEME_SEEDS.RED],
  ['ORANGE', THEME_SEEDS.ORANGE],
  ['AMBER', THEME_SEEDS.AMBER],
  ['YELLOW', THEME_SEEDS.YELLOW],
  ['LIME', THEME_SEEDS.LIME],
  ['GREEN', THEME_SEEDS.GREEN],
  ['TEAL', THEME_SEEDS.TEAL],
  ['CYAN', THEME_SEEDS.CYAN],
  ['AZURE', THEME_SEEDS.AZURE],
  ['BLUE', THEME_SEEDS.BLUE],
  ['VIOLET', THEME_SEEDS.VIOLET],
  ['PURPLE', THEME_SEEDS.PURPLE],
  ['MAGENTA', THEME_SEEDS.MAGENTA],
  ['PINK', THEME_SEEDS.PINK],
  ['BROWN', THEME_SEEDS.BROWN],
  ['GREY', THEME_SEEDS.GREY],
];

function renderPaletteData({color, colorName, isSelected$}: PaletteEntry): Observable<RenderSpec> {
  const colorCss = `rgb(${color.red}, ${color.green}, ${color.blue})`;

  const classes$ = isSelected$.pipe(
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

function getColor(event: Event): keyof ThemeSeed|null {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const colorName = target.getAttribute('color');
  if (!colorName) {
    return null;
  }

  return colorName as keyof ThemeSeed;
}
