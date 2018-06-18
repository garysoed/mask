import { ImmutableMap, ImmutableSet } from 'gs-tools/export/collect';
import { Color, Colors, HslColor, RgbColor } from 'gs-tools/export/color';
import { assertUnreachable } from '../../node_modules/gs-tools/src/typescript/assert-unreachable';
import * as colorCssTemplate from './color.css';

interface ColorWithAlpha {
  alpha: number;
  color: Color;
}

enum ColorSection {
  PASSIVE = 'Passive',
  SECONDARY = 'Secondary',
  ACTION = 'Action',
  ACTION_FOCUS = 'ActionFocus',
  ACTION_DISABLED = 'ActionDisabled',
  ACTIVE = 'Active',
  ACTION_PRIMARY = 'ActionPrimary',
  ACTION_PRIMARY_FOCUS = 'ActionPrimaryFocus',
  ACTION_PRIMARY_DISABLED = 'ActionPrimaryDisabled',
}

enum Shade {
  A100,
  B000,
  B010,
  B025,
  B050,
  B100,
  B125,
  B150,
  B175,
  B190,
  B200,
}

enum Alpha {
  HIGH,
  MEDIUM,
  LOW,
}

const SHADES: ImmutableSet<Shade> = ImmutableSet.of([
  Shade.B000,
  Shade.B010,
  Shade.B025,
  Shade.B050,
  Shade.B100,
  Shade.B125,
  Shade.B150,
  Shade.B175,
  Shade.B190,
  Shade.B200,
]);

const CONTRAST = Symbol('contrast');

interface ShadingSpec {
  alpha: Alpha;
  bg: Shade;
  fg: Shade|'contrast';
}

const LIGHT_SHADING = ImmutableMap.of<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: Shade.B200, fg: Shade.B010}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: Shade.B200, fg: Shade.B010}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: Shade.B200, fg: Shade.B050}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: Shade.B200, fg: Shade.A100}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: Shade.B200, fg: Shade.B010}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: Shade.B175, fg: Shade.B050}],
  [ColorSection.ACTION_PRIMARY,          {alpha: Alpha.HIGH,   bg: Shade.B125, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_FOCUS,    {alpha: Alpha.HIGH,   bg: Shade.A100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_DISABLED, {alpha: Alpha.LOW,    bg: Shade.B200, fg: Shade.B010}],
]);

const DARK_SHADING = ImmutableMap.of<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: Shade.B025, fg: Shade.B200}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: Shade.B025, fg: Shade.B200}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: Shade.B025, fg: Shade.B150}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: Shade.B025, fg: Shade.A100}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: Shade.B025, fg: Shade.B200}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: Shade.B175, fg: Shade.B050}],
  [ColorSection.ACTION_PRIMARY,          {alpha: Alpha.HIGH,   bg: Shade.B125, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_FOCUS,    {alpha: Alpha.HIGH,   bg: Shade.A100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_DISABLED, {alpha: Alpha.LOW,    bg: Shade.B025, fg: Shade.B200}],
]);

const HIGHLIGHT_SHADING = ImmutableMap.of<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: Shade.B100, fg: 'contrast'}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: Shade.B100, fg: 'contrast'}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: Shade.B100, fg: 'contrast'}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: Shade.B100, fg: Shade.A100}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: Shade.B100, fg: 'contrast'}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: Shade.B175, fg: Shade.B050}],
]);

const BLACK = RgbColor.newInstance(0, 0, 0);
const WHITE = RgbColor.newInstance(255, 255, 255);

function createColor_(shade: Shade, base: Color): Color {
  if (shade === Shade.A100) {
    return HslColor.newInstance(base.getHue(), 1, base.getLightness());
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

  injectCss(document: Document): void {
    const baseColorPairs = SHADES.mapItem(shade => {
      return [shade, createColor_(shade, this.baseColor_)] as [Shade, Color];
    });
    const baseColorMap = ImmutableMap.of(baseColorPairs);
    const highlightColor = createColor_(Shade.B010, this.highlightColor_);

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
        DARK_SHADING,
        baseColorMap,
        contrastShade,
        highlightColor);
    const cssContent = colorCssTemplate
        .replace('/*{themeLight}*/', generateColorCss_(lightColorMap))
        .replace('/*{themeDark}*/', generateColorCss_(darkColorMap))
        .replace('/*{themeHighlight}*/', generateColorCss_(highlightColorMap));

    const styleEl = document.createElement('style');
    styleEl.innerHTML = cssContent;
    document.head.appendChild(styleEl);
  }
}
