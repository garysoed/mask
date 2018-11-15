import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableList } from 'gs-tools/export/collect';
import { Color } from 'gs-tools/export/color';
import { BooleanParser, StringParser } from 'gs-tools/export/parse';
import { BooleanType, ElementWithTagType, HasPropertiesType, InstanceofType, IterableOfType, NullableType, StringType } from 'gs-types/export';
import { attribute, element, resolveLocators, slot } from 'persona/export/locator';
import { __renderId, ElementListRenderer, SimpleElementRenderer } from 'persona/export/renderer';
import { take } from 'rxjs/operators';
import { $theme } from '../src/app/app';
import { Palette } from '../src/theme/palette';
import { Theme } from '../src/theme/theme';
import { ThemedCustomElementCtrl } from '../src/theme/themed-custom-element-ctrl';
import { demoApp } from './demo-app';
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
        [__renderId]: StringParser,
        class: StringParser,
        color: StringParser,
        style: StringParser,
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
    expanded: attribute(element('option.el'), 'expanded', BooleanParser, BooleanType, false),
  },

  themeStyle: element('#theme', InstanceofType(HTMLStyleElement)),
});

const $isOnOption = instanceSourceId('isOnOption', BooleanType);
demoApp.vine.builder.source($isOnOption, false);

@demoApp.persona.customElement({
  tag: 'mk-demo',
  template: demoTemplate,
  watch: [
    $.accentPalette.el,
    $.basePalette.el,
    $.option.el,
    $.themeStyle,
  ],
})
@demoApp.persona.render($.option.expanded).withForwarding($isOnOption)
export class DemoCtrl extends ThemedCustomElementCtrl {
  constructor() {
    super($.themeStyle);
  }

  @demoApp.persona.onDom($.accentPalette.el, 'click')
  onAccentPaletteClick_(event: MouseEvent, vine: VineImpl): void {
    const color = getColor(event);
    if (!color) {
      return;
    }

    vine.getObservable($theme)
        .pipe(take(1))
        .subscribe(theme => vine.setValue($theme, theme.setHighlightColor(color)));
  }

  @demoApp.persona.onDom($.basePalette.el, 'click')
  onBasePaletteClick_(event: MouseEvent, vine: VineImpl): void {
    const color = getColor(event);
    if (!color) {
      return;
    }

    vine.getObservable($theme)
        .pipe(take(1))
        .subscribe(theme => vine.setValue($theme, theme.setBaseColor(color)));
  }

  @demoApp.persona.onDom($.option.el, 'mouseout')
  onMouseOutOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, false, this);
  }

  @demoApp.persona.onDom($.option.el, 'mouseover')
  onMouseOverOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, true, this);
  }

  @demoApp.persona.render($.accentPalette.slot)
  renderAccentPalette(
      @demoApp.vine.vineIn($theme) theme: Theme): ImmutableList<PaletteData> {
    return getPaletteData_(theme.highlightColor);
  }

  @demoApp.persona.render($.basePalette.slot)
  renderBasePalette(
      @demoApp.vine.vineIn($theme) theme: Theme): ImmutableList<PaletteData> {
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

const ORDERED_PALETTES: [string, Color][] = [
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
