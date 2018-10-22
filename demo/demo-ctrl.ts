import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableList, ImmutableMap, Orderings } from 'gs-tools/export/collect';
import { BooleanParser, StringParser } from 'gs-tools/export/parse';
import { BooleanType, ElementWithTagType, HasPropertiesType, InstanceofType, IterableOfType, NullableType, StringType } from 'gs-types/export';
import { attribute, element, resolveLocators, slot } from 'persona/export/locator';
import { __renderId, ElementListRenderer, SimpleElementRenderer } from 'persona/export/renderer';
import { Palette } from '../src/theme/palette';
import { ThemedCustomElementCtrl } from '../src/theme/themed-custom-element-ctrl';
import { demoApp } from './demo-app';
import demoTemplate from './demo.html';

interface PaletteData {
  [__renderId]: string;
  class: string;
  style: string;
}
const $ = resolveLocators({
  basePalette: {
    el: element<HTMLDivElement>('#basePalette', InstanceofType(HTMLDivElement)),
    slot: slot<ImmutableList<PaletteData>>(
        element('basePalette.el'),
        'basePalette',
        new ElementListRenderer<PaletteData>(
            new SimpleElementRenderer<PaletteData>(
                'div',
                {
                  [__renderId]: StringParser,
                  class: StringParser,
                  style: StringParser,
                },
            ),
        ),
        IterableOfType<PaletteData, ImmutableList<PaletteData>>(
            HasPropertiesType({
              [__renderId]: StringType,
              class: StringType,
              style: StringType,
            }),
        ),
    ),
  },
  option: {
    el: element<HTMLElement|null>('#option', ElementWithTagType('mk-drawer')),
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

  @demoApp.persona.onDom($.option.el, 'mouseout')
  onMouseOutOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, false, this);
  }

  @demoApp.persona.onDom($.option.el, 'mouseover')
  onMouseOverOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, true, this);
  }

  @demoApp.persona.render($.basePalette.slot)
  renderBasePalette(): ImmutableList<PaletteData> {
    return ImmutableList.of(ORDERED_PALETTES)
        .mapItem(color => {
          const colorCss = `rgb(${color.getRed()}, ${color.getGreen()}, ${color.getBlue()})`;

          return {
            [__renderId]: colorCss,
            class: 'palette',
            style: `background-color: ${colorCss};`,
          };
        });
  }
}

const ORDERED_PALETTES = [
  Palette.RED,
  Palette.ORANGE,
  Palette.AMBER,
  Palette.YELLOW,
  Palette.LIME,
  Palette.GREEN,
  Palette.SPRING,
  Palette.CYAN,
  Palette.SKY,
  Palette.AZURE,
  Palette.BLUE,
  Palette.VIOLET,
  Palette.PURPLE,
  Palette.MAGENTA,
  Palette.PINK,
  Palette.GREY,
];
