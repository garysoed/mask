import { $asMap, $map, $pipe, $zip, countableIterable } from '@gs-tools/collect';
import { Color } from '@gs-tools/color';
import { ArrayDiff } from '@gs-tools/rxjs';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { api, attributeOut, element, InitFn, onDom, RenderSpec, repeated, SimpleElementRenderSpec } from '@persona';
import { concat, Observable, of as observableOf } from '@rxjs';
import { filter, map, pairwise, switchMap, tap, withLatestFrom } from '@rxjs/operators';

import { $$ as $checkbox, Checkbox } from '../src/action/input/checkbox';
import { _p, _v } from '../src/app/app';
import { RootLayout } from '../src/layout/root-layout';
import { Palette } from '../src/theme/palette';
import { ThemedCustomElementCtrl } from '../src/theme/themed-custom-element-ctrl';
import { stringParser } from '../src/util/parsers';

import demoTemplate from './demo.html';

const $ = {
  accentPalette: element('accentPalette', InstanceofType(HTMLDivElement), {
    colorlist: repeated('accentPalette'),
    onClick: onDom<MouseEvent>('click'),
  }),
  basePalette: element('basePalette', InstanceofType(HTMLDivElement), {
    colorlist: repeated('basePalette'),
    onClick: onDom<MouseEvent>('click'),
  }),
  darkMode: element('darkMode', ElementWithTagType('mk-checkbox'), api($checkbox)),
  root: element('root', ElementWithTagType('section'), {
    theme: attributeOut('mk-theme', stringParser()),
  }),
};

export const TAG = 'mk-demo';

@_p.customElement({
  dependencies: [
    Checkbox,
    RootLayout,
  ],
  tag: TAG,
  template: demoTemplate,
})
export class DemoCtrl extends ThemedCustomElementCtrl {
  private readonly darkModeObs = this.declareInput($.darkMode._.value);
  private readonly onAccentClickObs = this.declareInput($.accentPalette._.onClick);
  private readonly onBaseClickObs = this.declareInput($.basePalette._.onClick);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupHandleAccentPaletteClick(),
      () => this.setupHandleBasePaletteClick(),
      this.renderStream($.accentPalette._.colorlist, this.renderAccentPalette),
      this.renderStream($.basePalette._.colorlist, this.renderBasePalette),
      this.renderStream($.root._.theme, this.renderTheme),
    ];
  }

  private renderAccentPalette(): Observable<ArrayDiff<RenderSpec>> {
    const initPaletteData = ORDERED_PALETTES
        .map(([colorName, color]) => createPaletteData(colorName, color, false));

    const diffObs = this.theme$.pipe(
        map(theme => theme.accentColor),
        pairwise(),
        switchMap(([oldColor, newColor]) => createDiffObs(oldColor, newColor)),
    );

    return concat(
        observableOf<ArrayDiff<RenderSpec>>({
          type: 'init' as 'init',
          value: initPaletteData,
        }),
        diffObs,
    );
  }

  private renderBasePalette(): Observable<ArrayDiff<RenderSpec>> {
    const initPaletteData = ORDERED_PALETTES
        .map(([colorName, color]) => createPaletteData(colorName, color, false));

    const diffObs = this.theme$.pipe(
        map(theme => theme.baseColor),
        pairwise(),
        switchMap(([oldColor, newColor]) => createDiffObs(oldColor, newColor)),
    );

    return concat(
        observableOf<ArrayDiff<RenderSpec>>({
          type: 'init' as 'init',
          value: initPaletteData,
        }),
        diffObs,
    );
  }

  private renderTheme(): Observable<'light'|'dark'> {
    return this.darkModeObs
        .pipe(
            map(isDarkMode => {
              if (!isDarkMode || isDarkMode === 'unknown') {
                return 'light';
              }

              return 'dark';
            }),
        );
  }

  private setupHandleAccentPaletteClick(): Observable<unknown> {
    return this.onAccentClickObs
        .pipe(
            map(event => getColor(event)),
            filter((color): color is Color => !!color),
            withLatestFrom(this.theme$),
            tap(([color, theme]) => {
              this.theme$.next(theme.setHighlightColor(color));
            }),
        );
  }

  private setupHandleBasePaletteClick(): Observable<unknown> {
    return this.onBaseClickObs
        .pipe(
            map(event => getColor(event)),
            filter((color): color is Color => !!color),
            withLatestFrom(this.theme$),
            tap(([color, theme]) => {
              this.theme$.next(theme.setBaseColor(color));
            }),
        );
  }
}

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
