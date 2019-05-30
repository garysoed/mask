import { createImmutableList } from '@gs-tools/collect';
import { Color, Colors, HslColor, RgbColor } from '@gs-tools/color';


export interface Shade {
  mixBG: boolean;
  /**
   * Ratio of the base color when mixing. 1 means to use the base color completely.
   */
  mixRatio: number;
}

export const B000 = {mixBG: true,  mixRatio: 0   };
export const B010 = {mixBG: true,  mixRatio: 0.1 };
export const B025 = {mixBG: true,  mixRatio: 0.25};
export const B050 = {mixBG: true,  mixRatio: 0.5 };
export const B075 = {mixBG: true,  mixRatio: 0.75};
export const B100 = {mixBG: true,  mixRatio: 1   };
export const B125 = {mixBG: false, mixRatio: 0.75};
export const B150 = {mixBG: false, mixRatio: 0.5 };
export const B175 = {mixBG: false, mixRatio: 0.25};
export const B190 = {mixBG: false, mixRatio: 0.1 };
export const B200 = {mixBG: false, mixRatio: 0   };

export const SHADES = createImmutableList([
  B000,
  B010,
  B025,
  B050,
  B075,
  B100,
  B125,
  B150,
  B175,
  B190,
  B200,
]);

const BLACK = RgbColor.newInstance(0, 0, 0);
const WHITE = RgbColor.newInstance(255, 255, 255);

export function createColor(shade: Shade, base: Color): Color {
  const mixAmount = shade.mixRatio;
  const backgroundColor = shade.mixBG ? BLACK : WHITE;

  return Colors.mix(base, backgroundColor, mixAmount);
}
