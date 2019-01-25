import { instanceSourceId } from 'grapevine/export/component';
import { $vine, VineImpl } from 'grapevine/export/main';
import { $exec, $map, asImmutableList, createImmutableList, ImmutableList } from 'gs-tools/export/collect';
import { Color } from 'gs-tools/export/color';
import { BooleanType, ElementWithTagType, InstanceofType } from 'gs-types/export';
import { element, onDom } from 'persona/export/input';
import { attributeOut, slot } from 'persona/export/output';
import { __renderId, ElementListRenderer, SimpleElementRenderer } from 'persona/export/renderer';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, tap, withLatestFrom } from 'rxjs/operators';
import { $theme, _p, _v } from '../src/app/app';
import { Config } from '../src/app/config';
import { Palette } from '../src/theme/palette';
import { Theme } from '../src/theme/theme';
import { ThemedCustomElementCtrl } from '../src/theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../src/util/parsers';
import demoTemplate from './demo.html';

interface PaletteData {
  [__renderId]: string;
  class: string;
  color: string;
  style: string;
}

const paletteElementListRenderer = new ElementListRenderer<PaletteData>(
  new SimpleElementRenderer<PaletteData>(
      'div',
      {
        [__renderId]: stringParser(),
        class: stringParser(),
        color: stringParser(),
        style: stringParser(),
      },
  ),
);

const $ = {
  accentPalette: element('accentPalette', InstanceofType(HTMLDivElement), {
    onClick: onDom('click'),
    slot: slot('accentPalette', paletteElementListRenderer),
  }),
  basePalette: element('basePalette', InstanceofType(HTMLDivElement), {
    onClick: onDom('click'),
    slot: slot('basePalette', paletteElementListRenderer),
  }),
  option: element('option', ElementWithTagType('mk-drawer'), {
    expanded: attributeOut('expanded', booleanParser()),
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
};

export const TAG = 'mk-demo';

const $isOnOption = instanceSourceId('isOnOption', BooleanType);
_v.builder.source($isOnOption, false);

@_p.customElement({
  tag: TAG,
  template: demoTemplate,
})
@_p.render($.option._.expanded).withForwarding($isOnOption)
export class DemoCtrl extends ThemedCustomElementCtrl {
  @_p.onCreate()
  handleAccentPaletteClick_(
      @_p.input($.accentPalette._.onClick) onClickObs: Observable<MouseEvent>,
      @_v.vineIn($theme) themeObs: Observable<Theme>,
      @_v.vineIn($vine) vineObs: Observable<VineImpl>,
  ): Observable<unknown> {
    return onClickObs
        .pipe(
            map(event => getColor(event)),
            filter((color): color is Color => !!color),
            withLatestFrom(themeObs, vineObs),
            tap(([color, theme, vine]) => {
              vine.setValue($theme, theme.setHighlightColor(color));
            }),
        );
  }

  @_p.onCreate()
  handleBasePaletteClick_(
      @_p.input($.basePalette._.onClick) onClickObs: Observable<MouseEvent>,
      @_v.vineIn($theme) themeObs: Observable<Theme>,
      @_v.vineIn($vine) vineObs: Observable<VineImpl>,
  ): Observable<unknown> {
    return onClickObs
        .pipe(
            map(event => getColor(event)),
            filter((color): color is Color => !!color),
            withLatestFrom(themeObs, vineObs),
            tap(([color, theme, vine]) => {
              vine.setValue($theme, theme.setBaseColor(color));
            }),
        );
  }

  @_p.onCreate()
  handleDrawerExpandCollapse_(
      @_p.input($.option._.onMouseOut) onMouseOutObs: Observable<Event>,
      @_p.input($.option._.onMouseOver) onMouseOverObs: Observable<Event>,
      @_v.vineIn($vine) vineObs: Observable<VineImpl>,
  ): Observable<unknown> {
    return merge(
        onMouseOutObs.pipe(mapTo(false)),
        onMouseOverObs.pipe(mapTo(true)),
    )
    .pipe(
        withLatestFrom(vineObs),
        tap(([showDrawer, vine]) => vine.setValue($isOnOption, showDrawer, this)),
    );
  }

  @_p.render($.accentPalette._.slot)
  renderAccentPalette(
      @_v.vineIn($theme) theme: Observable<Theme>,
  ): Observable<ImmutableList<PaletteData>> {
    return theme.pipe(map(theme => getPaletteData_(theme.highlightColor)));
  }

  @_p.render($.basePalette._.slot)
  renderBasePalette(
    @_v.vineIn($theme) theme: Observable<Theme>,
): Observable<ImmutableList<PaletteData>> {
  return theme.pipe(map(theme => getPaletteData_(theme.baseColor)));
  }
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
  ['CYAN', Palette.CYAN],
  ['AZURE', Palette.AZURE],
  ['BLUE', Palette.BLUE],
  ['VIOLET', Palette.VIOLET],
  ['PURPLE', Palette.PURPLE],
  ['MAGENTA', Palette.MAGENTA],
  ['PINK', Palette.PINK],
  ['BROWN', Palette.BROWN],
  ['GREEN', Palette.GREEN],
  ['TEAL', Palette.TEAL],
  ['GREY', Palette.GREY],
];

function getPaletteData_(selectedColor: Color): ImmutableList<PaletteData> {
  return $exec(
      createImmutableList(ORDERED_PALETTES),
      $map(([colorName, color]) => {
        const colorCss = `rgb(${color.getRed()}, ${color.getGreen()}, ${color.getBlue()})`;

        const classes = ['palette'];
        if (selectedColor === color) {
          classes.push('selected');
        }

        return {
          [__renderId]: colorName,
          class: classes.join(' '),
          color: colorName,
          style: `background-color: ${colorCss};`,
        };
      }),
      asImmutableList(),
  );
}

export function demoCtrl(): Config {
  return {
    tag: TAG,
  };
}
