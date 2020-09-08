import { Color, getContrast, mix, RgbColor } from 'gs-tools/export/color';

import { Alpha, getAlphaNumber } from './alpha';


export enum ShadeId {
  S000HI = '000HI',
  S010HI = '010HI',
  S010ML = '010ML',
  S010VL = '010VL',
  S050HI = '050HI',
  S050ML = '050ML',
  S100HI = '100HI',
  S175HI = '175HI',
  S200HI = '200HI',
  S200MH = '200MH',
  S200LO = '200LO',
  CONTRA = 'CONTR',
  FCONTR = 'FCONT',
}

const DARK_SHADE = ShadeId.S010HI;
const LIGHT_SHADE = ShadeId.S200HI;

type NonContrastShadeId = Exclude<ShadeId, ShadeId.CONTRA|ShadeId.FCONTR>;

export interface Shade {
  readonly isDarkMix: boolean;
  /**
   * Ratio of the base color when mixing. 1 means to use the base color completely.
   */
  readonly mixRatio: number;
  readonly alpha: Alpha;
}

export interface ColorWithAlpha {
  readonly color: Color;
  readonly alpha: number;
}

export const SHADES: ReadonlyMap<NonContrastShadeId, Shade> = new Map([
  [ShadeId.S000HI, {isDarkMix: true,  mixRatio: 0   , alpha: Alpha.HIGH}],
  [ShadeId.S010HI, {isDarkMix: true,  mixRatio: 0.1 , alpha: Alpha.HIGH}],
  [ShadeId.S010ML, {isDarkMix: true,  mixRatio: 0.1 , alpha: Alpha.MED_LOW}],
  [ShadeId.S010VL, {isDarkMix: true,  mixRatio: 0.1 , alpha: Alpha.VERY_LOW}],
  [ShadeId.S050HI, {isDarkMix: true,  mixRatio: 0.5 , alpha: Alpha.HIGH}],
  [ShadeId.S050ML, {isDarkMix: true,  mixRatio: 0.5 , alpha: Alpha.MED_LOW}],
  [ShadeId.S100HI, {isDarkMix: true,  mixRatio: 1   , alpha: Alpha.HIGH}],
  [ShadeId.S175HI, {isDarkMix: false, mixRatio: 0.25, alpha: Alpha.HIGH}],
  [ShadeId.S200HI, {isDarkMix: false, mixRatio: 0   , alpha: Alpha.HIGH}],
  [ShadeId.S200LO, {isDarkMix: false, mixRatio: 0   , alpha: Alpha.LOW}],
  [ShadeId.S200MH, {isDarkMix: false, mixRatio: 0   , alpha: Alpha.MED_HIGH}],
]);

const BLACK = new RgbColor(0, 0, 0);
const WHITE = new RgbColor(255, 255, 255);

export function createColor(
    shadeId: ShadeId,
    base: Color,
): ColorWithAlpha {
  if (shadeId === ShadeId.CONTRA || shadeId === ShadeId.FCONTR) {
    const contrastShade = getContrastShade(base);
    const color = createColor(contrastShade, base);
    if (shadeId === ShadeId.CONTRA) {
      return color;
    }

    const contrastAlpha = contrastShade === DARK_SHADE ? Alpha.MED_LOW : Alpha.MED_HIGH;
    const alpha = getAlphaNumber(contrastAlpha);
    return {color: color.color, alpha};
  }

  const shade = SHADES.get(shadeId);
  if (!shade) {
    throw new Error(`Shade ID ${shadeId} not found`);
  }
  const mixAmount = shade.mixRatio;
  const backgroundColor = shade.isDarkMix ? BLACK : WHITE;

  const color = mix(base, backgroundColor, mixAmount);
  const alpha = getAlphaNumber(shade.alpha);
  return {color, alpha};
}

function getContrastShade(baseColor: Color): ShadeId {
  const s100hiColor = createColor(ShadeId.S100HI, baseColor).color;
  const darkColor = createColor(DARK_SHADE, baseColor).color;
  const lightColor = createColor(LIGHT_SHADE, baseColor).color;

  const darkContrast = getContrast(darkColor, s100hiColor);
  const lightContrast = getContrast(lightColor, s100hiColor);
  return darkContrast > lightContrast ? DARK_SHADE : LIGHT_SHADE;
}
