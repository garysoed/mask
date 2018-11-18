import { ImmutableMap } from 'gs-tools/export/collect';
import { Color, Colors } from 'gs-tools/export/color';
import { assertUnreachable } from 'gs-tools/src/typescript/assert-unreachable';
import { Alpha } from './alpha';
import { ColorSection } from './color-section';
import * as generalCss from './general.css';
import { ACCENT_SHADES, B010, B100, B200, BASE_SHADES, createColor, Shade } from './shade';
import { DARK_SHADING, HIGHLIGHT_SHADING, LIGHT_SHADING, ShadingSpec } from './shading-spec';
import * as variablesCssTemplate from './variables.css';


function generateColorCss_(
    colorMap: ImmutableMap<ColorSection, {alpha: number; bg: Color; fg: Color}>): string {
  const lines = [];
  for (const [section, {alpha, bg, fg}] of colorMap) {
    lines.push(`--mkTheme${section}BG: rgb(${bg.getRed()},${bg.getGreen()},${bg.getBlue()});`);
    lines.push(
        `--mkTheme${section}FG: rgba(${fg.getRed()},${fg.getGreen()},${fg.getBlue()},${alpha});`);
  }

  return lines.join('\n');
}

function generateColorMap_(
    map: ImmutableMap<ColorSection, ShadingSpec>,
    colorMap: ImmutableMap<Shade, Color>,
    contrastShade: Shade,
): ImmutableMap<ColorSection, {alpha: number; bg: Color; fg: Color}> {
  return map.map(({alpha, bg, fg}) => {
    const normalizedFg = fg === 'contrast' ? contrastShade : fg;
    const fgColor = colorMap.get(normalizedFg);
    if (!fgColor) {
      throw new Error(`Color for shade ${normalizedFg} cannot be found`);
    }

    const bgColor = colorMap.get(bg);
    if (!bgColor) {
      throw new Error(`Color for shade ${bg} cannot be found`);
    }

    const numericAlpha = getAlphaValue_(alpha, normalizedFg);

    return {
      alpha: numericAlpha,
      bg: bgColor,
      fg: fgColor,
    };
  });
}

function getAlphaValue_(alpha: Alpha, colorShade: Shade): number {
  if (alpha === Alpha.HIGH) {
    return 1;
  }

  switch (colorShade) {
    case B010:
      switch (alpha) {
        case Alpha.MEDIUM:
          return 0.65;
        case Alpha.LOW:
          return 0.35;
        default:
          assertUnreachable(alpha);
      }
    case B200:
      switch (alpha) {
        case Alpha.MEDIUM:
          return 0.75;
        case Alpha.LOW:
          return 0.45;
        default:
          assertUnreachable(alpha);
      }
    default:
      throw new Error(`Unsupported color shade for alpha: ${colorShade}`);
  }
}

function getContrastForegroundShade_(
    shadingMap: ImmutableMap<Shade, Color>,
    highlightBackground: Color): Shade {
  const darkShade = B010;
  const lightShade = B200;
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
      readonly baseColor: Color,
      readonly highlightColor: Color) { }

  injectCss(styleEl: HTMLStyleElement): void {
    const baseColorPairs = BASE_SHADES.mapItem(shade => {
      return [shade, createColor(shade, this.baseColor)] as [Shade, Color];
    });
    const accentColorPairs = ACCENT_SHADES.mapItem(shade => {
      return [shade, createColor(shade, this.highlightColor)] as [Shade, Color];
    });
    const colorMap = ImmutableMap.of([
      ...baseColorPairs,
      ...accentColorPairs,
    ]);

    const b100 = colorMap.get(B100);
    if (!b100) {
      throw new Error(`Base color does not exist`);
    }
    const contrastShade = getContrastForegroundShade_(colorMap, b100);
    const lightColorMap = generateColorMap_(
        LIGHT_SHADING,
        colorMap,
        contrastShade,
    );
    const darkColorMap = generateColorMap_(
        DARK_SHADING,
        colorMap,
        contrastShade,
    );
    const highlightColorMap = generateColorMap_(
        HIGHLIGHT_SHADING,
        colorMap,
        contrastShade,
    );
    const cssContent = variablesCssTemplate
        .replace('/*{themeLight}*/', generateColorCss_(lightColorMap))
        .replace('/*{themeDark}*/', generateColorCss_(darkColorMap))
        .replace('/*{themeHighlight}*/', generateColorCss_(highlightColorMap));

    styleEl.innerHTML = `${cssContent}\n${generalCss}`;
  }

  setBaseColor(color: Color): Theme {
    return new Theme(color, this.highlightColor);
  }

  setHighlightColor(color: Color): Theme {
    return new Theme(this.baseColor, color);
  }
}
