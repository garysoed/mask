import {$asArray, $map, $pipe, $take, countableIterable} from 'gs-tools/export/collect';
import {Color, getContrast, RgbColor} from 'gs-tools/export/color';
import {cache} from 'gs-tools/export/data';
import {getAllValues} from 'gs-tools/export/typescript';
import {booleanType, enumType, hasPropertiesType, instanceofType, stringType} from 'gs-types';
import {CODE, Context, Ctrl, DIV, FIGURE, id, itarget, oattr, oclass, oflag, oforeach, ostyle, otext, query, registerCustomElement, RenderSpec, renderTemplate, TABLE, TD, TEMPLATE, TR} from 'persona';
import {Observable, of, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {ColorSection, Palette, ThemeContext, ThemeMode} from '../../src/theme/const';
import {renderTheme} from '../../src/theme/render-theme';
import {SPECS_RAW} from '../../src/theme/section-spec';
import {mixColor} from '../../src/theme/shade';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState, $theme$} from '../core/demo-state';

import template from './colors.html';


const PALETTE_MIX_VALUES = $pipe(
    countableIterable(),
    $take(21),
    $map(value => value * 10),
    $asArray(),
);

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

interface TableCell {
  readonly context: ThemeContext;
  readonly section: ColorSection;
  readonly isPrimary: boolean;
  readonly lightText: string;
  readonly darkText: string;
}

const TABLE_CELL_TYPE = hasPropertiesType<TableCell>({
  context: enumType<ThemeContext>(ThemeContext),
  section: enumType<ColorSection>(ColorSection),
  isPrimary: booleanType,
  lightText: stringType,
  darkText: stringType,
});

const $colorsDemo = {
  shadow: {
    _paletteItem: id('_paletteItem', TEMPLATE, {
      target: itarget(),
    }),
    _tableCell: id('_tableCell', TEMPLATE, {
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

    passiveRow: id('passiveRow', TR, {
      cells: oforeach('#cells', TABLE_CELL_TYPE),
    }),
    actionRow: id('actionRow', TR, {
      cells: oforeach('#cells', TABLE_CELL_TYPE),
    }),
    focusRow: id('focusRow', TR, {
      cells: oforeach('#cells', TABLE_CELL_TYPE),
    }),
    hoverRow: id('hoverRow', TR, {
      cells: oforeach('#cells', TABLE_CELL_TYPE),
    }),
    disabledRow: id('disabledRow', TR, {
      cells: oforeach('#cells', TABLE_CELL_TYPE),
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

  private getTableCells(section: ColorSection): Observable<readonly TableCell[]> {
    const cells: TableCell[] = [];
    for (const context of getAllValues<ThemeContext>(ThemeContext)) {
      cells.push({
        context,
        section,
        isPrimary: true,
        lightText: SPECS_RAW.get(ThemeMode.LIGHT)?.get(section)?.get(context)?.[0] ?? '',
        darkText: SPECS_RAW.get(ThemeMode.DARK)?.get(section)?.get(context)?.[0] ?? '',
      });

      cells.push({
        context,
        section,
        isPrimary: false,
        lightText: SPECS_RAW.get(ThemeMode.LIGHT)?.get(section)?.get(context)?.[1] ?? '',
        darkText: SPECS_RAW.get(ThemeMode.DARK)?.get(section)?.get(context)?.[1] ?? '',
      });
    }
    return of(cells);
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

  private renderTableCell(cell: TableCell): Observable<RenderSpec> {
    return of(
        renderTemplate({
          template$: this.$.shadow._tableCell.target as Observable<HTMLTemplateElement>,
          spec: {
            root: query('td', TD, {
              action1: oflag('mk-action-1'),
              action2: oflag('mk-action-2'),
              disabled: oflag('mk-disabled'),
              passive1: oflag('mk-passive-1'),
              passive2: oflag('mk-passive-2'),
              focus: oclass('focus'),
              hover: oclass('hover'),
              primarySection: oclass('primarySection'),
              themeContext: oattr('mk-theme-context'),
            }),
            light: query('code.light', CODE, {
              text: otext(),
            }),
            dark: query('code.dark', CODE, {
              text: otext(),
            }),
          },
          runs: $ => {
            const isPassive = cell.section === ColorSection.PASSIVE;
            const isPrimary = cell.isPrimary;
            return [
              of(!isPassive && isPrimary).pipe($.root.action1()),
              of(!isPassive && !isPrimary).pipe($.root.action2()),
              of(isPassive && isPrimary).pipe($.root.passive1()),
              of(isPassive && !isPrimary).pipe($.root.passive2()),
              of(cell.section === ColorSection.DISABLED).pipe($.root.disabled()),
              of(cell.section === ColorSection.FOCUS).pipe($.root.focus()),
              of(cell.section === ColorSection.HOVER).pipe($.root.hover()),
              of(isPrimary).pipe($.root.primarySection()),
              of(cell.context).pipe($.root.themeContext()),
              of(cell.lightText).pipe($.light.text()),
              of(cell.darkText).pipe($.dark.text()),
            ];
          },
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

      this.getTableCells(ColorSection.PASSIVE).pipe(
          this.$.shadow.passiveRow.cells(item => this.renderTableCell(item)),
      ),
      this.getTableCells(ColorSection.ACTION).pipe(
          this.$.shadow.actionRow.cells(item => this.renderTableCell(item)),
      ),
      this.getTableCells(ColorSection.FOCUS).pipe(
          this.$.shadow.focusRow.cells(item => this.renderTableCell(item)),
      ),
      this.getTableCells(ColorSection.HOVER).pipe(
          this.$.shadow.hoverRow.cells(item => this.renderTableCell(item)),
      ),
      this.getTableCells(ColorSection.DISABLED).pipe(
          this.$.shadow.disabledRow.cells(item => this.renderTableCell(item)),
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
