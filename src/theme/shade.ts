import { ImmutableSet } from 'gs-tools/export/collect';
import { Color, Colors, HslColor, RgbColor } from 'gs-tools/export/color';

export interface BaseShade {
  isDarkBG: boolean;
  /**
   * Ratio of the base color when mixing. 1 means to use the base color completely.
   */
  mixRatio: number;
  neonize?: boolean;
}

export interface AccentShade extends BaseShade {
  neonize: boolean;
}

export type Shade = BaseShade|AccentShade;

export const B000 = {isDarkBG: true,  mixRatio: 0   };
export const B010 = {isDarkBG: true,  mixRatio: 0.1 };
export const B025 = {isDarkBG: true,  mixRatio: 0.25};
export const B050 = {isDarkBG: true,  mixRatio: 0.5 };
export const B100 = {isDarkBG: true,  mixRatio: 1   };
export const B125 = {isDarkBG: false, mixRatio: 0.75};
export const B150 = {isDarkBG: false, mixRatio: 0.5 };
export const B175 = {isDarkBG: false, mixRatio: 0.25};
export const B190 = {isDarkBG: false, mixRatio: 0.1 };
export const B200 = {isDarkBG: false, mixRatio: 0   };

export const BASE_SHADES = ImmutableSet.of([
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
]);

export const A050 = {isDarkBG: true,  mixRatio: 0.5 , neonize: true};
export const A100 = {isDarkBG: true,  mixRatio: 1,    neonize: true};
export const A175 = {isDarkBG: false, mixRatio: 0.25, neonize: true};

export const ACCENT_SHADES = ImmutableSet.of([
  A050,
  A100,
  A175,
]);

const BLACK = RgbColor.newInstance(0, 0, 0);
const WHITE = RgbColor.newInstance(255, 255, 255);

export function createColor(shade: Shade, base: Color): Color {
  let foregroundColor = base;
  if (shade.neonize) {
    const lightness = base.getLightness();
    const saturation = base.getSaturation();

    if (saturation === 0) {
      foregroundColor = base;
    } else {
      const neon = Colors.neonize(base, 0.75);

      foregroundColor = HslColor.newInstance(
          neon.getHue(),
          (neon.getSaturation() + 1) / 2,
          (1 - lightness) * 0.5 + lightness);
    }
  }

  const mixAmount = shade.mixRatio;
  const backgroundColor = shade.isDarkBG ? BLACK : WHITE;

  return Colors.mix(foregroundColor, backgroundColor, mixAmount);
}
