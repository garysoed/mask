import {Color, getContrast, mix, RgbColor} from 'gs-tools/export/color';

import {AlphaLevel, Palette, Shade} from './const';


export interface ColorWithAlpha {
  readonly color: Color;
  readonly alpha: number;
}

interface Colors {
  readonly foreground: ColorWithAlpha;
  readonly background: ColorWithAlpha;
}

type Palettes = ReadonlyMap<Palette, Color>;

export function getColors(
    foregroundShade: Shade,
    backgroundShade: Shade,
    palettes: Palettes,
): Colors {
  const background = getColorWithAlpha(backgroundShade, palettes);
  const foreground = getColorWithAlpha(foregroundShade, palettes, background.color);

  return {foreground, background};
}

function getColorWithAlpha(
    shade: Shade,
    palettes: Palettes,
    background?: Color,
): ColorWithAlpha {
  const base = palettes.get(shade.palette);
  if (!base) {
    throw new Error(`Palette for ${shade.palette} not found`);
  }

  if (shade.mix === 'c') {
    if (!background) {
      throw new Error('Shade mix is "contrast", but background color not found');
    }
    return getContrastColorWithAlpha(base, background, shade.alpha);
  }

  if (shade.alpha === 'c') {
    throw new Error('"c" alpha is not compatible with non "contast" mix');
  }

  const color = mixColor(base, shade.mix);
  return {color, alpha: shade.alpha};
}

function getContrastColorWithAlpha(
    baseColor: Color,
    background: Color,
    alpha: AlphaLevel,
): ColorWithAlpha {
  const darkColor = mixColor(baseColor, 10);
  const lightColor = mixColor(baseColor, 200);

  const darkContrast = getContrast(darkColor, background);
  const lightContrast = getContrast(lightColor, background);
  const useDark = darkContrast > lightContrast;
  const color = useDark ? darkColor : lightColor;

  if (alpha === 'c') {
    return {
      color,
      alpha: useDark ? 0.65 : 0.75,
    };
  }

  return {color, alpha};
}


const BLACK = new RgbColor(0, 0, 0);
const WHITE = new RgbColor(255, 255, 255);
function mixColor(base: Color, mixValue: number): Color {
  if (mixValue === 100) {
    return base;
  }

  if (mixValue < 100) {
    return mix(base, BLACK, mixValue / 100);
  }

  return mix(base, WHITE, (200 - mixValue) / 100);
}