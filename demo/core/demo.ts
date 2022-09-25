import {Color} from 'gs-tools/export/color';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable, forwardTo} from 'gs-tools/export/rxjs';
import {enumType} from 'gs-types';
import {Context, Ctrl, DIV, ievent, itarget, oattr, ocase, oforeach, ostyle, otext, query, registerCustomElement, renderElement, RenderSpec, renderTemplate, SPAN, TEMPLATE} from 'persona';
import {merge, Observable, of, OperatorFunction} from 'rxjs';
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
import {ACTION_SPECS, ALL_SPECS, DISPLAY_SPECS, GENERAL_SPECS, getPageSpec, LAYOUT_SPECS, PageSpec} from './page-spec';


interface PaletteEntry {
  readonly colorName: string;
  readonly color: Color;
  readonly isSelected$: Observable<boolean>;
}

const $demo = {
  host: {},
  shadow: {
    _pageButton: query('#_pageButton', TEMPLATE, {
      target: itarget(),
    }),
    _paletteCell: query('#_paletteCell', TEMPLATE, {
      target: itarget(),
    }),
    accentPalette: query('#accentPalette', DIV, {
      content: oforeach<PaletteEntry>('#content'),
      onClick: ievent('click', MouseEvent),
    }),
    basePalette: query('#basePalette', DIV, {
      content: oforeach<PaletteEntry>('#content'),
      onClick: ievent('click', MouseEvent),
    }),
    content: query('#content', DIV, {
      content: ocase<PageSpec|null>('#content'),
    }),
    drawerRoot: query('#drawerRoot', DIV, {
      actionContents: oforeach<PageSpec>('#actionContents'),
      displayContents: oforeach<PageSpec>('#displayContents'),
      generalContents: oforeach<PageSpec>('#generalContents'),
      layoutContents: oforeach<PageSpec>('#layoutContents'),
      onAction: ievent(ACTION_EVENT, ActionEvent),
    }),
    darkMode: query('#darkMode', CHECKBOX),
    rootLayout: query('#rootLayout', ROOT_LAYOUT, {
      onAction: ievent(ACTION_EVENT, ActionEvent, {matchTarget: true}),
    }),
    settingsDrawer: query('#settingsDrawer', DRAWER_LAYOUT, {
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
      this.accentPaletteContents$.pipe(this.$.shadow.accentPalette.content(this.renderPaletteData())),
      this.basePaletteContents$.pipe(this.$.shadow.basePalette.content(this.renderPaletteData())),
      of($demoState.get(this.$.vine).isDarkMode).pipe(this.$.shadow.darkMode.value()),
      $locationService.get(this.$.vine).location$.pipe(
          map(location => getPageSpec(location.type)),
          this.$.shadow.content.content(this.renderMainContent()),
      ),
      of(ACTION_SPECS).pipe(this.$.shadow.drawerRoot.actionContents(this.renderPageButtons())),
      of(DISPLAY_SPECS).pipe(this.$.shadow.drawerRoot.displayContents(this.renderPageButtons())),
      of(GENERAL_SPECS).pipe(this.$.shadow.drawerRoot.generalContents(this.renderPageButtons())),
      of(LAYOUT_SPECS).pipe(this.$.shadow.drawerRoot.layoutContents(this.renderPageButtons())),
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
            isSelected$: $demoState.get(this.$.vine).accentColorName
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
            isSelected$: $demoState.get(this.$.vine).baseColorName
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

  private renderMainContent(): OperatorFunction<PageSpec|null, RenderSpec|null> {
    return map(spec => {
      if (!spec) {
        return null;
      }

      return renderElement({spec: {}, registration: spec.registration});
    });
  }

  private renderPageButtons(): OperatorFunction<PageSpec, RenderSpec> {
    return map(({path, name}) => {
      return renderTemplate({
        template$: this.$.shadow._pageButton.target,
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
      });
    });
  }

  renderPaletteData(): OperatorFunction<PaletteEntry, RenderSpec> {
    return map(({color, colorName, isSelected$}) => {
      const colorCss = `rgb(${color.red}, ${color.green}, ${color.blue})`;

      const classes$ = isSelected$.pipe(
          map(selected => {
            return selected ? ['palette', 'selected'] : ['palette'];
          }),
          map(classes => classes.join(' ')),
      );

      return renderTemplate({
        template$: this.$.shadow._paletteCell.target,
        spec: {
          div: query('div', DIV, {
            backgroundColor: ostyle('backgroundColor'),
            class: oattr('class'),
            color: oattr('color'),
          }),
        },
        runs: $ => [
          classes$.pipe($.div.class()),
          of(colorName).pipe($.div.color()),
          of(colorCss).pipe($.div.backgroundColor()),
        ],
      });
    });
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
            forwardTo($demoState.get(this.$.vine).accentColorName),
        );
  }

  @cache()
  private get onBasePaletteClick$(): Observable<unknown> {
    return this.$.shadow.basePalette.onClick
        .pipe(
            map(event => getColor(event)),
            filterNonNullable(),
            forwardTo($demoState.get(this.$.vine).baseColorName),
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
