import {Color, RgbColor} from 'gs-tools/export/color';

const GREY = new RgbColor(128, 142, 154);
const RED = new RgbColor(220, 51, 0);
const ORANGE = new RgbColor(255, 120, 1);
const AMBER = new RgbColor(255, 193, 1);
const YELLOW = new RgbColor(255, 251, 1);
const LIME = new RgbColor(125, 255, 1);
const GREEN = new RgbColor(0, 192, 22);
const TEAL = new RgbColor(0, 192, 148);
const CYAN = new RgbColor(1, 208, 255);
const AZURE = new RgbColor(1, 162, 255);
const BLUE = new RgbColor(0, 52, 223);
const VIOLET = new RgbColor(54, 0, 196);
const PURPLE = new RgbColor(127, 0, 224);
const MAGENTA = new RgbColor(186, 0, 226);
const PINK = new RgbColor(220, 0, 131);
const BROWN = new RgbColor(136, 64, 0);

export interface ThemeSeed {
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

export const THEME_SEEDS = {
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
