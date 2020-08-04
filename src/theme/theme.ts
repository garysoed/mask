import { Color, Colors } from 'gs-tools/export/color';
import { cache } from 'gs-tools/export/data';
import { assertUnreachable, getAllValues } from 'gs-tools/export/typescript';

import { Alpha } from './alpha';
import { ColorSection } from './color-section';
import generalCss from './general.css';
import { B010, B100, B190, createColor, Shade, SHADES } from './shade';
import { DARK_SHADING, HIGHLIGHT_DARK_SHADING, HIGHLIGHT_LIGHT_SHADING, LIGHT_SHADING, ShadingSpec } from './shading-spec';
import variablesCssTemplate from './variables.css';

interface RenderedColorSpec {
  bg: Color;
  fg: Color;
  primary: number;
  secondary: number;
}

function generateColorCss(
    colorMap: Map<ColorSection, RenderedColorSpec>,
    highlightColorMap: Map<ColorSection, RenderedColorSpec>,
): string {
  const lines = [];
  for (const [section, {bg, fg, primary, secondary}] of colorMap) {
    lines.push(`--mkTheme${section}BG: rgb(${bg.getRed()},${bg.getGreen()},${bg.getBlue()});`);
    lines.push([
      `--mkTheme${section}FG1: `,
      `rgba(${fg.getRed()},`,
      `${fg.getGreen()},`,
      `${fg.getBlue()},`,
      `${primary});`,
    ].join(''));
    lines.push([
      `--mkTheme${section}FG2: `,
      `rgba(${fg.getRed()},`,
      `${fg.getGreen()},`,
      `${fg.getBlue()},`,
      `${secondary});`,
    ].join(''));
  }

  for (const [section, {bg, fg, primary, secondary}] of highlightColorMap) {
    lines.push(
        `--mkThemeHighlight${section}BG: rgb(${bg.getRed()},${bg.getGreen()},${bg.getBlue()});`);
    lines.push([
      `--mkThemeHighlight${section}FG1: `,
      `rgba(${fg.getRed()},`,
      `${fg.getGreen()},`,
      `${fg.getBlue()},`,
      `${primary});`,
    ].join(''));
    lines.push([
      `--mkThemeHighlight${section}FG2: `,
      `rgba(${fg.getRed()},`,
      `${fg.getGreen()},`,
      `${fg.getBlue()},`,
      `${secondary});`,
    ].join(''));
  }

  return lines.join('\n');
}

function generateColorMap(
    map: Map<ColorSection, ShadingSpec>,
    baseColors: Map<Shade, Color>,
    accentColors: Map<Shade, Color>,
    contrastBaseShade: Shade,
    contrastAccentShade: Shade,
): Map<ColorSection, RenderedColorSpec> {
  const colorMap = new Map<ColorSection, RenderedColorSpec>();
  for (const [key, spec] of map) {
    const useAccent = spec.accent;
    const map = useAccent ? accentColors : baseColors;
    const contrast = useAccent ? contrastAccentShade : contrastBaseShade;
    const shade = spec.shade === 'contrast' ? contrast : spec.shade;

    const fg = map.get(shade);
    if (!fg) {
      throw new Error(`Color for shade ${shade} cannot be found`);
    }

    const bg = map.get(spec.bg);
    if (!bg) {
      throw new Error(`Color for shade ${spec.bg} cannot be found`);
    }

    colorMap.set(
        key,
        {
          bg,
          fg,
          primary: getAlphaValue(spec.primary, shade),
          secondary: getAlphaValue(spec.secondary, shade),
        },
    );
  }

  return colorMap;
}

function getAlphaValue(alpha: Alpha, colorShade: Shade): number {
  if (alpha === Alpha.HIGH) {
    return 1;
  }

  if (colorShade.mixBG) {
    switch (alpha) {
      case Alpha.MEDIUM:
        return 0.65;
      case Alpha.LOW:
        return 0.35;
      default:
        throw assertUnreachable(alpha);
    }
  } else {
    switch (alpha) {
      case Alpha.MEDIUM:
        return 0.75;
      case Alpha.LOW:
        return 0.45;
      default:
        throw assertUnreachable(alpha);
    }
  }
}

function getContrastForegroundShade(
    shadingMap: Map<Shade, Color>,
    highlightBackground: Color): Shade {
  const darkShade = B010;
  const lightShade = B190;
  const darkForeground = shadingMap.get(darkShade);
  const lightForeground = shadingMap.get(lightShade);

  if (!darkForeground) {
    throw new Error(`Cannot find color for ${darkShade}`);
  }

  if (!lightForeground) {
    throw new Error(`Cannot find color for ${lightShade}`);
  }

  const darkContrast = Colors.getContrast(darkForeground, highlightBackground);
  const lightContrast = Colors.getContrast(lightForeground, highlightBackground);

  return darkContrast > lightContrast ? darkShade : lightShade;
}


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
    const baseColorPairs = new Map<Shade, Color>();
    const accentColorPairs = new Map<Shade, Color>();
    for (const shade of SHADES) {
      baseColorPairs.set(shade, createColor(shade, this.baseColor));
      accentColorPairs.set(shade, createColor(shade, this.accentColor));
    }

    const baseB100 = baseColorPairs.get(B100);
    if (!baseB100) {
      throw new Error(`Base color does not exist`);
    }
    const accentB100 = accentColorPairs.get(B100);
    if (!accentB100) {
      throw new Error('Accent color does not exist');
    }

    const contrastBaseShade = getContrastForegroundShade(baseColorPairs, baseB100);
    const contrastAccentShade = getContrastForegroundShade(accentColorPairs, accentB100);
    const lightColorMap = generateColorMap(
        LIGHT_SHADING,
        baseColorPairs,
        accentColorPairs,
        contrastBaseShade,
        contrastAccentShade,
    );
    const darkColorMap = generateColorMap(
        DARK_SHADING,
        baseColorPairs,
        accentColorPairs,
        contrastBaseShade,
        contrastAccentShade,
    );
    const highlightLightColorMap = generateColorMap(
        HIGHLIGHT_LIGHT_SHADING,
        baseColorPairs,
        accentColorPairs,
        contrastBaseShade,
        contrastAccentShade,
    );
    const highlightDarkColorMap = generateColorMap(
        HIGHLIGHT_DARK_SHADING,
        baseColorPairs,
        accentColorPairs,
        contrastBaseShade,
        contrastAccentShade,
    );
    const cssContent = variablesCssTemplate
        .replace(/\/\*{themeLight}\*\//g, generateColorCss(lightColorMap, highlightLightColorMap))
        .replace(/\/\*{themeDark}\*\//g, generateColorCss(darkColorMap, highlightDarkColorMap))
        .replace(
            '/*{themeHighlightLight}*/',
            generateColorCss(highlightLightColorMap, lightColorMap),
        )
        .replace(
            '/*{themeHighlightDark}*/',
            generateColorCss(highlightDarkColorMap, darkColorMap),
        )
        .replace(
            '/*{themeHighlightSwitch}*/',
            generateHighlightSwitch(),
        );

    const styleEl = this.document.createElement('style');
    styleEl.innerHTML = `${cssContent}\n${generalCss}`;
    return styleEl;
  }
}

function generateHighlightSwitch(): string {
  const sections: string[] = [];
  for (const section of getAllValues(ColorSection)) {
    sections.push(`--mkTheme${section}FG1: var(--mkThemeHighlight${section}FG1);`);
    sections.push(`--mkTheme${section}FG2: var(--mkThemeHighlight${section}FG2);`);
    sections.push(`--mkTheme${section}BG: var(--mkThemeHighlight${section}BG);`);
  }

  return sections.join('\n');
}
