import { $declareKeyed, $map, $pipe, $zip, asImmutableMap, countable, createImmutableList } from '@gs-tools/collect';
import { Color } from '@gs-tools/color';
import { ArrayDiff } from '@gs-tools/rxjs';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { InitFn } from '@persona';
import { element, onDom } from '@persona/input';
import { api } from '@persona/main';
import { repeated } from '@persona/output';
import { concat, Observable, of as observableOf } from 'rxjs';
import { filter, map, pairwise, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../src/app/app';
import { Config } from '../src/app/config';
import { $$ as $rootLayout, RootLayout } from '../src/layout/root-layout';
// import { $$ as $checkbox, Checkbox, CheckedValue } from '../src/input/checkbox';
import { Palette } from '../src/theme/palette';
import { ThemedCustomElementCtrl } from '../src/theme/themed-custom-element-ctrl';
import demoTemplate from './demo.html';

interface PaletteData {
  class: string;
  color: string;
  style: string;
}

type PaletteD = {class: string; color: string; style: string};

const $ = {
  accentPalette: element('accentPalette', InstanceofType(HTMLDivElement), {
    colorlist: repeated<PaletteD>('accentPalette', 'div'),
    onClick: onDom<MouseEvent>('click'),
  }),
  basePalette: element('basePalette', InstanceofType(HTMLDivElement), {
    colorlist: repeated<PaletteD>('basePalette', 'div'),
    onClick: onDom<MouseEvent>('click'),
  }),
  // darkMode: element('darkMode', ElementWithTagType('mk-checkbox'), api($checkbox)),
  root: element('root', ElementWithTagType('mk-root-layout'), api($rootLayout)),
};

export const TAG = 'mk-demo';

@_p.customElement({
  dependencies: [
    // Checkbox,
    RootLayout,
  ],
  tag: TAG,
  template: demoTemplate,
})
export class DemoCtrl extends ThemedCustomElementCtrl {
  private readonly onClickObs = _p.input($.accentPalette._.onClick, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.setupHandleAccentPaletteClick,
      this.setupHandleBasePaletteClick,
      _p.render($.accentPalette._.colorlist).withVine(_v.stream(this.renderAccentPalette, this)),
      _p.render($.basePalette._.colorlist).withVine(_v.stream(this.renderBasePalette, this)),
      _p.render($.root._.theme).withVine(_v.stream(this.renderTheme, this)),
      // _p.render($.root._.theme).with(_v.stream(this.renderTheme)),
    ];
  }

  renderAccentPalette(): Observable<ArrayDiff<PaletteData>> {
    const initPaletteData = ORDERED_PALETTES
        .map(([colorName, color]) => createPaletteData(colorName, color, false));

    const diffObs = this.themeSbj.pipe(
        map(theme => theme.highlightColor),
        pairwise(),
        switchMap(([oldColor, newColor]) => createDiffObs(oldColor, newColor)),
    );

    return concat(
        observableOf<ArrayDiff<PaletteData>>({type: 'init' as 'init', payload: initPaletteData}),
        diffObs,
    );
  }

  renderBasePalette(): Observable<ArrayDiff<PaletteData>> {
    const initPaletteData = ORDERED_PALETTES
        .map(([colorName, color]) => createPaletteData(colorName, color, false));

    const diffObs = this.themeSbj.pipe(
        map(theme => theme.baseColor),
        pairwise(),
        switchMap(([oldColor, newColor]) => createDiffObs(oldColor, newColor)),
    );

    return concat(
        observableOf<ArrayDiff<PaletteData>>({type: 'init' as 'init', payload: initPaletteData}),
        diffObs,
    );
  }

  renderTheme(
      // @_p.input($.darkMode._.value) darkModeObs: Observable<CheckedValue>,
  ): Observable<'light'|'dark'> {
    return observableOf('light');
    // return darkModeObs
    //     .pipe(
    //         map(isDarkMode => {
    //           if (!isDarkMode || isDarkMode === 'unknown') {
    //             return 'light';
    //           }

    //           return 'dark';
    //         }),
    //     );
  }

  setupHandleAccentPaletteClick(): Observable<unknown> {
    return this.onClickObs
        .pipe(
            map(event => getColor(event)),
            filter((color): color is Color => !!color),
            withLatestFrom(this.themeSbj),
            tap(([color, theme]) => {
              this.themeSbj.next(theme.setHighlightColor(color));
            }),
        );
  }

  setupHandleBasePaletteClick(): Observable<unknown> {
    return this.onClickObs
        .pipe(
            map(event => getColor(event)),
            filter((color): color is Color => !!color),
            withLatestFrom(this.themeSbj),
            tap(([color, theme]) => {
              this.themeSbj.next(theme.setBaseColor(color));
            }),
        );
  }
}

function createDiffObs(oldColor: Color, newColor: Color): Observable<ArrayDiff<PaletteData>> {
  const diffs: Array<ArrayDiff<PaletteData>> = [];

  const oldIndex = COLOR_TO_INDEX.get(oldColor);
  const oldName = COLOR_TO_NAME.get(oldColor);
  if (oldIndex !== undefined && oldName !== undefined) {
    diffs.push({
      index: oldIndex,
      payload: createPaletteData(oldName, oldColor, false),
      type: 'set',
    });
  }

  const newIndex = COLOR_TO_INDEX.get(newColor);
  const newName = COLOR_TO_NAME.get(newColor);
  if (newIndex !== undefined && newName !== undefined) {
    diffs.push({
      index: newIndex,
      payload: createPaletteData(newName, newColor, true),
      type: 'set',
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

const ORDERED_PALETTES: Array<[string, Color]> = [
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
const COLOR_TO_INDEX = new Map<Color, number>([...$pipe(
    createImmutableList(ORDERED_PALETTES),
    $map(([, color]) => color),
    $zip(countable()),
    $declareKeyed(([color]) => color),
    asImmutableMap<Color, number>(),
)]);
const COLOR_TO_NAME = new Map<Color, string>([...$pipe(
    createImmutableList(ORDERED_PALETTES),
    $map(([colorName, color]) => [color, colorName] as [Color, string]),
    $declareKeyed(([color]) => color),
    asImmutableMap<Color, string>(),
)]);

function createPaletteData(colorName: string, color: Color, selected: boolean): PaletteData {
  const colorCss = `rgb(${color.getRed()}, ${color.getGreen()}, ${color.getBlue()})`;

  const classes = ['palette'];
  if (selected) {
    classes.push('selected');
  }

  return {
    class: classes.join(' '),
    color: colorName,
    style: `background-color: ${colorCss};`,
  };
}

export function demoCtrl(): Config {
  return {
    tag: TAG,
  };
}
