import { Vine } from 'grapevine';
import { $asMap, $map, $pipe } from 'gs-tools/export/collect';
import { Color } from 'gs-tools/export/color';
import { assertByType, filterNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType, enumType } from 'gs-types';
import { attributeOut, element, multi, onDom, PersonaContext, renderCustomElement, renderElement, single, stringParser } from 'persona';
import { combineLatest, merge, Observable, of as observableOf } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, mapTo, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { $button, $checkbox, $drawer, $rootLayout, _p, ACTION_EVENT, Button, Checkbox, CroppedLine, Drawer, IconWithText, LayoutOverlay, Palette, RootLayout, ThemedCustomElementCtrl } from '../../export';
import { $theme } from '../../src/app/app';
import { $lineLayout, LineLayout } from '../../src/layout/line-layout';

import { COMPONENT_SPECS } from './component-spec';
import template from './demo.html';
import { $locationService, Views } from './location-service';


const $ = {
  accentPalette: element('accentPalette', elementWithTagType('div'), {
    content: multi('content'),
    onClick: onDom<MouseEvent>('click'),
  }),
  basePalette: element('basePalette', elementWithTagType('div'), {
    content: multi('content'),
    onClick: onDom<MouseEvent>('click'),
  }),
  components: element('components', elementWithTagType('div'), {
    componentButtons: multi('componentButtons'),
    onClick: onDom('click'),
  }),
  content: element('content', elementWithTagType('div'), {
    content: single('content'),
  }),
  darkMode: element('darkMode', $checkbox, {}),
  root: element('root', elementWithTagType('section'), {
    theme: attributeOut('mk-theme', stringParser()),
  }),
  rootLayout: element('rootLayout', $rootLayout, {
    onAction: onDom(ACTION_EVENT),
  }),
  settingsDrawer: element('settingsDrawer', $drawer, {
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
};

const COMPONENT_DEPENDENCIES = COMPONENT_SPECS.map(({ctor}) => ctor);
const COMPONENT_PATH_ATTR = 'path';

@_p.customElement({
  dependencies: [
    ...COMPONENT_DEPENDENCIES,
    Button,
    Checkbox,
    CroppedLine,
    Drawer,
    IconWithText,
    LayoutOverlay,
    LineLayout,
    RootLayout,
  ],
  tag: 'mkd-demo',
  template,
  api: {},
})
export class Demo extends ThemedCustomElementCtrl {
  private readonly darkMode$ = this.declareInput($.darkMode._.value);
  private readonly onAccentPaletteClick$ = this.declareInput($.accentPalette._.onClick);
  private readonly onBasePaletteClick$ = this.declareInput($.basePalette._.onClick);
  private readonly onDrawerRootClick$ = this.declareInput($.components._.onClick);
  private readonly onRootLayoutAction$ = this.declareInput($.rootLayout._.onAction);
  private readonly onSettingsDrawerMouseOut$ = this.declareInput($.settingsDrawer._.onMouseOut);
  private readonly onSettingsDrawerMouseOver$ = this.declareInput($.settingsDrawer._.onMouseOver);

  constructor(context: PersonaContext) {
    super(context);
    this.render($.accentPalette._.content, this.renderAccentPaletteContents());
    this.render($.basePalette._.content, this.renderBasePaletteContents());
    this.render($.components._.componentButtons, this.renderComponentButtons());
    this.render($.content._.content, this.renderMainContent());
    this.render($.settingsDrawer._.expanded, this.renderSettingsDrawerExpanded());
    this.render($.root._.theme, this.renderRootTheme());
    this.addSetup(this.setupOnAccentPaletteClick());
    this.addSetup(this.setupOnBasePaletteClick());
    this.addSetup(this.setupOnComponentButtonClick(context.vine));
    this.addSetup(this.setupOnRootLayoutAction(context.vine));
  }

  private renderAccentPaletteContents(): Observable<readonly Node[]> {
    const selectedColor$ = this.theme$.pipe(map(theme => theme.accentColor));
    const paletteNode$List = ORDERED_PALETTES
        .map(([colorName, color]) => {
          const isSelected$ = selectedColor$.pipe(
              map(selected => {
                const selectedName = COLOR_TO_NAME.get(selected);
                return selectedName === colorName;
              }),
          );
          return renderPaletteData(
              colorName,
              color,
              isSelected$,
              this.context,
          );
        });

    return paletteNode$List.length <= 0 ? observableOf([]) : combineLatest(paletteNode$List);
  }

  private renderBasePaletteContents(): Observable<readonly Node[]> {
    const selectedColor$ = this.theme$.pipe(map(theme => theme.baseColor));
    const paletteNode$List = ORDERED_PALETTES
        .map(([colorName, color]) => {
          const isSelected$ = selectedColor$.pipe(
              map(selected => {
                const selectedName = COLOR_TO_NAME.get(selected);
                return selectedName === colorName;
              }),
          );
          return renderPaletteData(
              colorName,
              color,
              isSelected$,
              this.context,
          );
        });

    return paletteNode$List.length <= 0 ? observableOf([]) : combineLatest(paletteNode$List);
  }

  private renderComponentButtons(): Observable<readonly Node[]> {
    const componentNode$List = COMPONENT_SPECS.map(({name, path}) => {
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

    return componentNode$List.length <= 0 ? observableOf([]) : combineLatest(componentNode$List);
  }

  private renderMainContent(): Observable<Node> {
    return $locationService.get(this.vine).pipe(
        switchMap(locationService => locationService.getLocation()),
        map(location => {
          return COMPONENT_SPECS.find(({path}) => path === location.type);
        }),
        switchMap(spec => {
          if (!spec) {
            return renderElement('div', {}, this.context);
          }

          return renderElement(spec.tag, {}, this.context);
        }),
    );
  }

  private renderRootTheme(): Observable<'light'|'dark'> {
    return this.darkMode$
        .pipe(
            map(({value: isDarkMode}) => {
              if (!isDarkMode || isDarkMode === 'unknown') {
                return 'light';
              }

              return 'dark';
            }),
        );
  }

  private renderSettingsDrawerExpanded(): Observable<boolean> {
    return merge(
        this.onSettingsDrawerMouseOut$.pipe(debounceTime(100), mapTo(false)),
        this.onSettingsDrawerMouseOver$.pipe(debounceTime(100), mapTo(true)),
    )
    .pipe(
        distinctUntilChanged(),
    );
  }

  private setupOnAccentPaletteClick(): Observable<unknown> {
    return this.onAccentPaletteClick$
        .pipe(
            map(event => getColor(event)),
            filter((color): color is Color => !!color),
            withLatestFrom(this.theme$),
            tap(([color, theme]) => {
              $theme.set(this.vine, () => theme.setHighlightColor(color));
            }),
        );
  }

  private setupOnBasePaletteClick(): Observable<unknown> {
    return this.onBasePaletteClick$
        .pipe(
            map(event => getColor(event)),
            filter((color): color is Color => !!color),
            withLatestFrom(this.theme$),
            tap(([color, theme]) => {
              $theme.set(this.vine, () => theme.setBaseColor(color));
            }),
        );
  }

  private setupOnComponentButtonClick(vine: Vine): Observable<unknown> {
    return this.onDrawerRootClick$
        .pipe(
            map(event => {
              const target = event.target;
              if (!(target instanceof HTMLElement)) {
                return null;
              }

              return target.getAttribute(COMPONENT_PATH_ATTR) || null;
            }),
            filterNonNull(),
            assertByType(enumType<Views>(Views)),
            withLatestFrom($locationService.get(vine)),
            tap(([type, locationService]) => {
              locationService.goToPath(type, {});
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

const ORDERED_PALETTES: ReadonlyArray<[string, Color]> = [
  ['RED', Palette.RED],
  ['ORANGE', Palette.ORANGE],
  ['AMBER', Palette.AMBER],
  ['YELLOW', Palette.YELLOW],
  ['LIME', Palette.LIME],
  ['GREEN', Palette.GREEN],
  ['TEAL', Palette.TEAL],
  ['CYAN', Palette.CYAN],
  ['AZURE', Palette.AZURE],
  ['BLUE', Palette.BLUE],
  ['VIOLET', Palette.VIOLET],
  ['PURPLE', Palette.PURPLE],
  ['MAGENTA', Palette.MAGENTA],
  ['PINK', Palette.PINK],
  ['BROWN', Palette.BROWN],
  ['GREY', Palette.GREY],
];

const COLOR_TO_NAME: ReadonlyMap<Color, string> = $pipe(
    ORDERED_PALETTES,
    $map(([colorName, color]) => [color, colorName] as [Color, string]),
    $asMap(),
);

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

function getColor(event: MouseEvent): Color|null {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const colorName = target.getAttribute('color');
  if (!colorName) {
    return null;
  }

  return (Palette as any)[colorName] || null;
}
