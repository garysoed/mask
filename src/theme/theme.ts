import { $asArray, $flat, $map, $pipe } from 'gs-tools/export/collect';
import { Color } from 'gs-tools/export/color';
import { cache } from 'gs-tools/export/data';

import generalCss from './general.css';
import { PRIMARY_DARK_HIGHLIGHT_SECTION_SPECS, PRIMARY_DARK_SECTION_SPECS, PRIMARY_LIGHT_HIGHLIGHT_SECTION_SPECS, PRIMARY_LIGHT_SECTION_SPECS, SECONDARY_DARK_HIGHLIGHT_SECTION_SPECS, SECONDARY_DARK_SECTION_SPECS, SECONDARY_LIGHT_HIGHLIGHT_SECTION_SPECS, SECONDARY_LIGHT_SECTION_SPECS, SectionSpec } from './section-spec';
import { ColorWithAlpha, createColor } from './shade';


export class Theme {
  constructor(
      private readonly document: Document,
      readonly baseColor: Color,
      readonly accentColor: Color,
  ) { }

  getStyleEl(): HTMLStyleElement {
    return this.createStyleEl();
  }

  setBaseColor(color: Color): Theme {
    return new Theme(this.document, color, this.accentColor);
  }

  setHighlightColor(color: Color): Theme {
    return new Theme(this.document, this.baseColor, color);
  }

  @cache()
  private createStyleEl(): HTMLStyleElement {
    const cssDeclarations = [
      this.generateSectionThemeCss(false),
      this.generateSectionThemeCss(true),
      this.generateHighlightThemeCss(),
    ];

    const styleEl = this.document.createElement('style');
    styleEl.innerHTML = `${cssDeclarations.join('\n\n')}\n${generalCss}`;
    return styleEl;
  }

  private generateHighlightThemeCss(): string {
    // Just use the light ones. The dark ones will be the same.
    const cssVariables = $pipe(
        [...PRIMARY_LIGHT_SECTION_SPECS, ...SECONDARY_LIGHT_SECTION_SPECS],
        $map(spec => {
          const cssNormalFgVar = getSectionVariableName(spec, true);
          const cssNormalBgVar = getSectionVariableName(spec, false);

          const highlightSpec = {...spec, isHighlight: true};
          const cssHighlightFgVar = getSectionVariableName(highlightSpec, true);
          const cssHighlightBgVar = getSectionVariableName(highlightSpec, false);

          return [
            `${cssNormalBgVar}: var(${cssHighlightBgVar});`,
            `${cssNormalFgVar}: var(${cssHighlightFgVar});`,
          ];
        }),
        $flat(),
        $asArray(),
    )
    .join('\n');

    return `[mk-theme-highlight] { ${cssVariables} }`;
  }

  private generateSectionThemeCss(isDark: boolean): string {
    const normalSectionSpecs = isDark ?
        [...PRIMARY_DARK_SECTION_SPECS, ...SECONDARY_DARK_SECTION_SPECS] :
        [...PRIMARY_LIGHT_SECTION_SPECS, ...SECONDARY_LIGHT_SECTION_SPECS];
    const highlightSectionSpecs = isDark ?
        [...PRIMARY_DARK_HIGHLIGHT_SECTION_SPECS, ...SECONDARY_DARK_HIGHLIGHT_SECTION_SPECS] :
        [...PRIMARY_LIGHT_HIGHLIGHT_SECTION_SPECS, ...SECONDARY_LIGHT_HIGHLIGHT_SECTION_SPECS];

    const cssVariables = $pipe(
        [...normalSectionSpecs, ...highlightSectionSpecs],
        $map(spec => {
          const base = spec.isBase ? this.baseColor : this.accentColor;
          const cssFgVar = getSectionVariableName(spec, true);
          const cssBgVar = getSectionVariableName(spec, false);
          const cssFgColor = generateCssColor(createColor(spec.fg, base));
          const cssBgColor = generateCssColor(createColor(spec.bg, base));
          return [
            `${cssFgVar}: ${cssFgColor};`,
            `${cssBgVar}: ${cssBgColor};`,
          ];
        }),
        $flat(),
        $asArray(),
    )
    .join('\n');

    const theme = isDark ? 'dark' : 'light';
    return `[mk-theme="${theme}"] { ${cssVariables} }`;
  }
}

function getSectionVariableName(sectionSpec: SectionSpec, isForeground: boolean): string {
  return [
    '--mkTheme',
    sectionSpec.section,
    isForeground ? 'FG' : 'BG',
    sectionSpec.isSecondary ? '2' : '1',
    sectionSpec.isHighlight ? 'H' : 'B',
  ].join('');
}

function generateCssColor({color, alpha}: ColorWithAlpha): string {
  return `rgba(${color.red},${color.green},${color.blue},${alpha})`;
}
