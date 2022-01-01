import {Color, RgbColor} from 'gs-tools/export/color';

const GREY = new RgbColor(128, 142, 154);
const RED = new RgbColor(220, 28, 0);
const ORANGE = new RgbColor(255, 120, 1);
const AMBER = new RgbColor(255, 193, 1);
const YELLOW = new RgbColor(255, 251, 1);
const LIME = new RgbColor(126, 225, 32);
const GREEN = new RgbColor(0, 192, 22);
const TEAL = new RgbColor(0, 192, 148);
const CYAN = new RgbColor(32, 222, 224);
const AZURE = new RgbColor(32, 154, 224);
const BLUE = new RgbColor(28, 67, 195);
const VIOLET = new RgbColor(65, 24, 172);
const PURPLE = new RgbColor(123, 28, 196);
const MAGENTA = new RgbColor(167, 29, 197);
const PINK = new RgbColor(220, 0, 131);
const BROWN = new RgbColor(136, 64, 0);

export interface Palette {
  readonly AMBER: Color;
  readonly AZURE: Color;
  readonly BLUE: Color;
  readonly BROWN: Color;
  readonly CYAN: Color;
  readonly GREEN: Color;
  readonly GREY: Color;
  readonly LIME: Color;
  readonly MAGENTA: Color;
  readonly ORANGE: Color;
  readonly PINK: Color;
  readonly PURPLE: Color;
  readonly RED: Color;
  readonly TEAL: Color;
  readonly VIOLET: Color;
  readonly YELLOW: Color;
}

export const PALETTE = {
  AMBER,
  AZURE,
  BLUE,
  BROWN,
  CYAN,
  GREEN,
  GREY,
  LIME,
  MAGENTA,
  ORANGE,
  PINK,
  PURPLE,
  RED,
  TEAL,
  VIOLET,
  YELLOW,
};
