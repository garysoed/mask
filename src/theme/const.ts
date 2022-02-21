export enum Palette {
  PASSIVE = 'P',
  HIGHLIGHT = 'H',
  ACTION = 'A',
}

export enum ColorSection {
  PASSIVE = 'passive',
  ACTION = 'action',
  HOVER = 'hover',
  FOCUS = 'focus',
  DISABLED = 'disabled',
}

export enum ThemeMode {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum ThemeSubtype {
  PRIMARY = '1',
  SECONDARY = '2',
}

export enum ThemeContext {
  MAIN = 'main',
  SIDE = 'side',
  HIGHLIGHT = 'highlight',
}

export enum ColorLocation {
  BACKGROUND = 'bg',
  FOREGROUND = 'fg',
}

export type MixType = number|'c';

export type AlphaLevel = number|'c';

export interface Shade {
  readonly palette: Palette;
  readonly mix: MixType;
  readonly alpha: AlphaLevel;
}