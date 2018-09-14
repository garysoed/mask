import { ImmutableMap } from 'gs-tools/export/collect';
import { Color, Colors, HslColor, RgbColor } from 'gs-tools/export/color';
import { assertUnreachable } from 'gs-tools/src/typescript/assert-unreachable';
import { Alpha } from './alpha';
import { ColorSection } from './color-section';
import * as generalCss from './general.css';
import { DARK_SHADING, HIGHLIGHT_SHADING, LIGHT_SHADING, Shade, SHADES, ShadingSpec } from './shade';
import * as variablesCssTemplate from './variables.css';

const BLACK = RgbColor.newInstance(0, 0, 0);
const WHITE = RgbColor.newInstance(255, 255, 255);

function createColor_(shade: Shade, base: Color): Color {
  if (shade === Shade.A100) {
    return HslColor.newInstance(base.getHue(), (base.getSaturation() + 1) / 2, base.getLightness());
  }

  const mixAmount = getMixAmount_(shade);
  const backgroundColor = getBackgroundMixColor_(shade);

  return Colors.mix(base, backgroundColor, mixAmount);
}

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
    baseColorMap: ImmutableMap<Shade, Color>,
    contrastShade: Shade,
    highlightColor: Color): ImmutableMap<ColorSection, {alpha: number; bg: Color; fg: Color}> {
  return map.map(({alpha, bg, fg}) => {
    const normalizedFg = fg === 'contrast' ? contrastShade : fg;
    const fgColor: Color|undefined = normalizedFg === Shade.A100 ?
        highlightColor : baseColorMap.get(normalizedFg);
    if (!fgColor) {
      throw new Error(`Color for shade ${normalizedFg} cannot be found`);
    }

    const bgColor = bg === Shade.A100 ? highlightColor : baseColorMap.get(bg);
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
    case Shade.B010:
      switch (alpha) {
        case Alpha.MEDIUM:
          return 0.65;
        case Alpha.LOW:
          return 0.35;
        default:
          assertUnreachable(alpha);
      }
    case Shade.B200:
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

function getBackgroundMixColor_(shade: Shade): Color {
  switch (shade) {
    case Shade.A100:
    case Shade.B000:
    case Shade.B010:
    case Shade.B025:
    case Shade.B050:
    case Shade.B100:
      return BLACK;
    case Shade.B125:
    case Shade.B150:
    case Shade.B175:
    case Shade.B190:
    case Shade.B200:
      return WHITE;
  }
}

function getContrastForegroundShade_(
    shadingMap: ImmutableMap<Shade, Color>,
    highlightBackground: Color): Shade {
  const darkShade = Shade.B010;
  const lightShade = Shade.B200;
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

function getMixAmount_(shade: Shade): number {
  switch (shade) {
    case Shade.A100:
    case Shade.B100:
      return 1;
    case Shade.B000:
    case Shade.B200:
      return 0;
    case Shade.B010:
    case Shade.B190:
      return 0.1;
    case Shade.B025:
    case Shade.B175:
      return 0.25;
    case Shade.B050:
    case Shade.B150:
      return 0.5;
    case Shade.B125:
      return 0.75;
  }
}

export class Theme {
  constructor(
      private readonly baseColor_: Color,
      private readonly highlightColor_: Color) { }

  injectCss(styleEl: HTMLStyleElement): void {
    const baseColorPairs = SHADES.mapItem(shade => {
      return [shade, createColor_(shade, this.baseColor_)] as [Shade, Color];
    });
    const baseColorMap = ImmutableMap.of(baseColorPairs);
    const highlightColor = createColor_(Shade.A100, this.highlightColor_);

    const contrastShade = getContrastForegroundShade_(baseColorMap, highlightColor);
    const lightColorMap = generateColorMap_(
        LIGHT_SHADING,
        baseColorMap,
        contrastShade,
        highlightColor);
    const darkColorMap = generateColorMap_(
        DARK_SHADING,
        baseColorMap,
        contrastShade,
        highlightColor);
    const highlightColorMap = generateColorMap_(
        HIGHLIGHT_SHADING,
        baseColorMap,
        contrastShade,
        highlightColor);
    const cssContent = variablesCssTemplate
        .replace('/*{themeLight}*/', generateColorCss_(lightColorMap))
        .replace('/*{themeDark}*/', generateColorCss_(darkColorMap))
        .replace('/*{themeHighlight}*/', generateColorCss_(highlightColorMap));

    styleEl.innerHTML = `${cssContent}\n${generalCss}`;
  }
}
