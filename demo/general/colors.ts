import {Color, getContrast, RgbColor} from 'gs-tools/export/color';
import {cache} from 'gs-tools/export/data';
import {hasPropertiesType, instanceofType, stringType} from 'gs-types';
import {CODE, Context, Ctrl, DIV, FIGURE, id, itarget, oclass, oforeach, ostyle, otext, query, registerCustomElement, RenderSpec, renderTemplate, TABLE, TEMPLATE} from 'persona';
import {Observable, of, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {Palette} from '../../src/theme/const';
import {renderTheme} from '../../src/theme/render-theme';
import {mixColor} from '../../src/theme/shade';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState, $theme$} from '../core/demo-state';

import template from './colors.html';


const PALETTE_MIX_VALUES = [
  0,
  20,
  40,
  60,
  80,
  100,
  120,
  140,
  160,
  180,
  200,
];

const BLACK = new RgbColor(0, 0, 0);
const WHITE = new RgbColor(255, 255, 255);

interface PaletteItem {
  readonly text: string;
  readonly color: Color;
  readonly textColor: Color;
}

const PALETTE_ITEM_TYPE = hasPropertiesType<PaletteItem>({
  color: instanceofType(Color),
  text: stringType,
  textColor: instanceofType(Color),
});

const $colorsDemo = {
  shadow: {
    _paletteItem: id('_paletteItem', TEMPLATE, {
      target: itarget(),
    }),
    accentSeed: id('accentSeed', FIGURE, {
      backgroundColor: ostyle('backgroundColor'),
    }),
    baseSeed: id('baseSeed', FIGURE, {
      backgroundColor: ostyle('backgroundColor'),
    }),

    actionPalette: id('actionPalette', DIV, {
      content: oforeach('#content', PALETTE_ITEM_TYPE),
    }),
    passivePalette: id('passivePalette', DIV, {
      content: oforeach('#content', PALETTE_ITEM_TYPE),
    }),
    highlightPalette: id('highlightPalette', DIV, {
      content: oforeach('#content', PALETTE_ITEM_TYPE),
    }),

    table: id('table', TABLE, {
      darkClass: oclass('dark'),
    }),
  },
};


class ColorsDemo implements Ctrl {
  private readonly theme$ = $theme$.get(this.$.vine);

  constructor(private readonly $: Context<typeof $colorsDemo>) { }

  private getPalettes(palette: Palette): Observable<readonly PaletteItem[]> {
    return this.theme$.pipe(
        map(theme => {
          const baseColor = theme.paletteBaseColorMap.get(palette);
          if (!baseColor) {
            throw new Error(`No base color found for ${palette}`);
          }

          return PALETTE_MIX_VALUES.map(value => {
            const color = mixColor(baseColor, value);
            const blackContrast = getContrast(BLACK, color);
            const whiteContrast = getContrast(WHITE, color);
            return {
              text: `${palette[0].toUpperCase()}${value.toString().padStart(3, '0')}`,
              textColor: blackContrast > whiteContrast ? BLACK : WHITE,
              color,
            };
          });
        }),
    );
  }

  private renderPaletteItem(item: PaletteItem): Observable<RenderSpec> {
    return of(
        renderTemplate({
          template$: this.$.shadow._paletteItem.target as Observable<HTMLTemplateElement>,
          spec: {
            box: query('.paletteItem', DIV, {
              backgroundColor: ostyle('backgroundColor'),
            }),
            code: query('.paletteItem code', CODE, {
              color: ostyle('color'),
              textContent: otext(),
            }),
          },
          runs: $ => [
            of(item.color).pipe(formatColor(), $.box.backgroundColor()),
            of(item.text).pipe($.code.textContent()),
            of(item.textColor).pipe(formatColor(), $.code.color()),
          ],
        }),
    );
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.getPalettes(Palette.PASSIVE).pipe(
          this.$.shadow.passivePalette.content(item => this.renderPaletteItem(item)),
      ),
      this.getPalettes(Palette.ACTION).pipe(
          this.$.shadow.actionPalette.content(item => this.renderPaletteItem(item)),
      ),
      this.getPalettes(Palette.HIGHLIGHT).pipe(
          this.$.shadow.highlightPalette.content(item => this.renderPaletteItem(item)),
      ),
      this.theme$.pipe(
          map(theme => theme.baseSeed),
          formatColor(),
          this.$.shadow.baseSeed.backgroundColor(),
      ),
      this.theme$.pipe(
          map(theme => theme.accentSeed),
          formatColor(),
          this.$.shadow.accentSeed.backgroundColor(),
      ),
      $demoState.get(this.$.vine).$('isDarkMode').pipe(
          map(isDark => !!isDark),
          this.$.shadow.table.darkClass(),
      ),
    ];
  }
}

function formatColor(): OperatorFunction<Color, string> {
  return map(color => `rgb(${color.red}, ${color.green}, ${color.blue})`);
}

export const COLORS_DEMO = registerCustomElement({
  ctrl: ColorsDemo,
  deps:[
    DEMO_LAYOUT,
  ],
  spec: $colorsDemo,
  tag: 'mkd-colors',
  template,
});
