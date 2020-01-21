import { $checkbox, $drawer, $textIconButton, _p,  _v, ACTION_EVENT, Checkbox, Drawer, IconWithText, LayoutOverlay, Palette, RootLayout, stringParser, ThemedCustomElementCtrl } from 'export';

import { Vine } from '@grapevine';
import { $asMap, $map, $pipe, $zip, countableIterable } from '@gs-tools/collect';
import { Color } from '@gs-tools/color';
import { ArrayDiff, filterNonNull } from '@gs-tools/rxjs';
import { elementWithTagType } from '@gs-types';
import { api, attributeOut, element, InitFn, onDom, RenderSpec, repeated, SimpleElementRenderSpec, single } from '@persona';
import { merge, Observable, of as observableOf } from '@rxjs';
import { distinctUntilChanged, filter, map, mapTo, pairwise, startWith, switchMap, tap, withLatestFrom } from '@rxjs/operators';

import { COMPONENT_SPECS } from './component-spec';
import template from './demo.html';
import { $locationService, Views } from './location-service';


const $ = {
  accentPalette: element('accentPalette', elementWithTagType('div'), {
    content: repeated('content'),
    onClick: onDom<MouseEvent>('click'),
  }),
  basePalette: element('basePalette', elementWithTagType('div'), {
    content: repeated('content'),
    onClick: onDom<MouseEvent>('click'),
  }),
  components: element('components', elementWithTagType('div'), {
    componentButtons: repeated('componentButtons'),
    onClick: onDom('click'),
  }),
  content: element('content', elementWithTagType('div'), {
    content: single('content'),
  }),
  darkMode: element('darkMode', elementWithTagType('mk-checkbox'), api($checkbox)),
  root: element('root', elementWithTagType('section'), {
    theme: attributeOut('mk-theme', stringParser()),
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
    Checkbox,
    Drawer,
    IconWithText,
    LayoutOverlay,
    RootLayout,
  ],
  tag: 'mkd-demo',
  template,
})
export class Demo extends ThemedCustomElementCtrl {
  private readonly darkMode$ = this.declareInput($.darkMode._.value);
  private readonly onAccentPaletteClick$ = this.declareInput($.accentPalette._.onClick);
  private readonly onBasePaletteClick$ = this.declareInput($.basePalette._.onClick);
  private readonly onDrawerRootClick$ = this.declareInput($.components._.onClick);
  private readonly onRootLayoutAction$ = this.declareInput($.rootLayout._.onAction);
  private readonly onSettingsDrawerMouseOut$ = this.declareInput($.settingsDrawer._.onMouseOut);
  private readonly onSettingsDrawerMouseOver$ = this.declareInput($.settingsDrawer._.onMouseOver);

  getInitFunctions(): readonly InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.renderStream($.accentPalette._.content, this.renderAccentPaletteContents),
      this.renderStream($.basePalette._.content, this.renderBasePaletteContents),
      this.renderStream($.components._.componentButtons, this.renderComponentButtons),
      this.renderStream($.content._.content, this.renderMainContent),
      this.renderStream($.settingsDrawer._.expanded, this.renderSettingsDrawerExpanded),
      this.renderStream($.root._.theme, this.renderRootTheme),
      () => this.setupOnAccentPaletteClick(),
      () => this.setupOnBasePaletteClick(),
      vine => this.setupOnComponentButtonClick(vine),
      vine => this.setupOnRootLayoutAction(vine),
    ];
  }

  private renderAccentPaletteContents(): Observable<ArrayDiff<RenderSpec>> {
    const initPaletteData = ORDERED_PALETTES
        .map(([colorName, color]) => createPaletteData(colorName, color, false));

    const diff$ = this.theme$.pipe(
        map(theme => theme.accentColor),
        pairwise(),
        switchMap(([oldColor, newColor]) => createDiffObs(oldColor, newColor)),
    );

    return diff$.pipe(
        startWith({
          type: 'init' as 'init',
          value: initPaletteData,
        }),
    );
  }

  private renderBasePaletteContents(): Observable<ArrayDiff<RenderSpec>> {
    const initPaletteData = ORDERED_PALETTES
        .map(([colorName, color]) => createPaletteData(colorName, color, false));

    const diff$ = this.theme$.pipe(
        map(theme => theme.baseColor),
        pairwise(),
        switchMap(([oldColor, newColor]) => createDiffObs(oldColor, newColor)),
    );

    return diff$.pipe(
        startWith({
          type: 'init' as 'init',
          value: initPaletteData,
        }),
    );
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

  private renderRootTheme(): Observable<'light'|'dark'> {
    return this.darkMode$
        .pipe(
            map(isDarkMode => {
              if (!isDarkMode || isDarkMode === 'unknown') {
                return 'light';
              }

              return 'dark';
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

  private setupOnAccentPaletteClick(): Observable<unknown> {
    return this.onAccentPaletteClick$
        .pipe(
            map(event => getColor(event)),
            filter((color): color is Color => !!color),
            withLatestFrom(this.theme$),
            tap(([color, theme]) => {
              this.theme$.next(theme.setHighlightColor(color));
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
              this.theme$.next(theme.setBaseColor(color));
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
const COLOR_TO_INDEX: ReadonlyMap<Color, number> = $pipe(
    ORDERED_PALETTES,
    $map(([, color]) => color),
    $zip(countableIterable()),
    $asMap(),
);

const COLOR_TO_NAME: ReadonlyMap<Color, string> = $pipe(
    ORDERED_PALETTES,
    $map(([colorName, color]) => [color, colorName] as [Color, string]),
    $asMap(),
);

function createDiffObs(oldColor: Color, newColor: Color):
    Observable<ArrayDiff<RenderSpec>> {
  const diffs: Array<ArrayDiff<RenderSpec>> = [];

  const oldIndex = COLOR_TO_INDEX.get(oldColor);
  const oldName = COLOR_TO_NAME.get(oldColor);
  if (oldIndex !== undefined && oldName !== undefined) {
    diffs.push({
      index: oldIndex,
      type: 'set',
      value: createPaletteData(oldName, oldColor, false),
    });
  }

  const newIndex = COLOR_TO_INDEX.get(newColor);
  const newName = COLOR_TO_NAME.get(newColor);
  if (newIndex !== undefined && newName !== undefined) {
    diffs.push({
      index: newIndex,
      type: 'set',
      value: createPaletteData(newName, newColor, true),
    });
  }

  return observableOf(...diffs);
}

function createPaletteData(colorName: string, color: Color, selected: boolean):
    RenderSpec {
  const colorCss = `rgb(${color.getRed()}, ${color.getGreen()}, ${color.getBlue()})`;

  const classes = ['palette'];
  if (selected) {
    classes.push('selected');
  }

  return new SimpleElementRenderSpec(
      'div',
      new Map([
        ['class', classes.join(' ')],
        ['color', colorName],
        ['style', `background-color: ${colorCss};`],
      ]),
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
