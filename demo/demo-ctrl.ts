import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableList } from 'gs-tools/export/collect';
import { Color } from 'gs-tools/export/color';
import { BooleanType, ElementWithTagType, HasPropertiesType, InstanceofType, IterableOfType, NullableType, StringType } from 'gs-types/export';
import { attribute, element, resolveLocators, slot } from 'persona/export/locator';
import { __renderId, ElementListRenderer, SimpleElementRenderer } from 'persona/export/renderer';
import { take } from 'rxjs/operators';
import { booleanParser, stringParser } from 'src/util/parsers';
import { $theme, _p, _v } from '../src/app/app';
import { Config } from '../src/app/config';
import { Palette } from '../src/theme/palette';
import { Theme } from '../src/theme/theme';
import { ThemedCustomElementCtrl } from '../src/theme/themed-custom-element-ctrl';
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

const paletteDataType = IterableOfType<PaletteData, ImmutableList<PaletteData>>(
  HasPropertiesType({
    [__renderId]: StringType,
    class: StringType,
    color: StringType,
    style: StringType,
  }),
);

const $ = resolveLocators({
  accentPalette: {
    el: element<HTMLDivElement>('#accentPalette', InstanceofType(HTMLDivElement)),
    slot: slot(
        element('accentPalette.el'),
        'accentPalette',
        paletteElementListRenderer,
        paletteDataType,
    ),
  },
  basePalette: {
    el: element<HTMLDivElement>('#basePalette', InstanceofType(HTMLDivElement)),
    slot: slot(
        element('basePalette.el'),
        'basePalette',
        paletteElementListRenderer,
        paletteDataType,
    ),
  },
  option: {
    el: element<HTMLElement>('#option', ElementWithTagType('mk-drawer')),
    expanded: attribute(element('option.el'), 'expanded', booleanParser(), BooleanType, false),
  },
});

export const TAG = 'mk-demo';

const $isOnOption = instanceSourceId('isOnOption', BooleanType);
_v.builder.source($isOnOption, false);

@_p.customElement({
  tag: TAG,
  template: demoTemplate,
  watch: [
    $.accentPalette.el,
    $.basePalette.el,
    $.option.el,
  ],
})
@_p.render($.option.expanded).withForwarding($isOnOption)
export class DemoCtrl extends ThemedCustomElementCtrl {
  @_p.onDom($.accentPalette.el, 'click')
  onAccentPaletteClick_(event: MouseEvent, vine: VineImpl): void {
    const color = getColor(event);
    if (!color) {
      return;
    }

    vine.getObservable($theme)
        .pipe(take(1))
        .subscribe(theme => vine.setValue($theme, theme.setHighlightColor(color)));
  }

  @_p.onDom($.basePalette.el, 'click')
  onBasePaletteClick_(event: MouseEvent, vine: VineImpl): void {
    const color = getColor(event);
    if (!color) {
      return;
    }

    vine.getObservable($theme)
        .pipe(take(1))
        .subscribe(theme => vine.setValue($theme, theme.setBaseColor(color)));
  }

  @_p.onDom($.option.el, 'mouseout')
  onMouseOutOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, false, this);
  }

  @_p.onDom($.option.el, 'mouseover')
  onMouseOverOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, true, this);
  }

  @_p.render($.accentPalette.slot)
  renderAccentPalette(
      @_v.vineIn($theme) theme: Theme): ImmutableList<PaletteData> {
    return getPaletteData_(theme.highlightColor);
  }

  @_p.render($.basePalette.slot)
  renderBasePalette(
      @_v.vineIn($theme) theme: Theme): ImmutableList<PaletteData> {
    return getPaletteData_(theme.baseColor);
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
  return ImmutableList.of(ORDERED_PALETTES)
      .mapItem(([colorName, color]) => {
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
      });
}

export function demoCtrl(): Config {
  return {
    tag: TAG,
  };
}
