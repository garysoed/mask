import {$asArray, $map, $pipe} from 'gs-tools/export/collect';

import {ColorSection} from './color-section';
import {ShadeId} from './shade';

export enum ShadeType {
  BASE = 0,
  ACCENT = 1,
  GREYSCALE = 2,
}

export interface SectionSpec {
  readonly isDark: boolean;
  readonly isHighlight: boolean;
  readonly isSecondary: boolean;
  readonly section: ColorSection;
  readonly fgType: ShadeType;
  readonly fg: ShadeId;
  readonly bgType: ShadeType;
  readonly bg: ShadeId;
}


export const PRIMARY_LIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {
        section: ColorSection.PASSIVE,
        fgType: ShadeType.BASE,
        fg: ShadeId.S010HI,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S200HI,
      },
      {
        section: ColorSection.ACTION,
        fgType: ShadeType.BASE,
        fg: ShadeId.CONTRA,
        bgType: ShadeType.BASE,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.FOCUS,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.S050HI,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.HOVER,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.CONTRA,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.DISABLED,
        fgType: ShadeType.BASE,
        fg: ShadeId.S010VL,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S200HI,
      },
    ],
    $map(spec => ({...spec, isDark: false, isSecondary: false, isHighlight: false})),
    $asArray(),
);

export const SECONDARY_LIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {
        section: ColorSection.PASSIVE,
        fgType: ShadeType.BASE,
        fg: ShadeId.S010ML,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S200HI,
      },
      {
        section: ColorSection.ACTION,
        fgType: ShadeType.BASE,
        fg: ShadeId.S050HI,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S200HI,
      },
      {
        section: ColorSection.FOCUS,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.S050ML,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.HOVER,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.FCONTR,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.DISABLED,
        fgType: ShadeType.BASE,
        fg: ShadeId.S010VL,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S200HI,
      },
    ],
    $map(spec => ({...spec, isDark: false, isSecondary: true, isHighlight: false})),
    $asArray(),
);

export const PRIMARY_DARK_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {
        section: ColorSection.PASSIVE,
        fgType: ShadeType.GREYSCALE,
        fg: ShadeId.S200HI,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S050HI,
      },
      {
        section: ColorSection.ACTION,
        fgType: ShadeType.BASE,
        fg: ShadeId.CONTRA,
        bgType: ShadeType.BASE,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.FOCUS,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.S050HI,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.HOVER,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.CONTRA,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.DISABLED,
        fgType: ShadeType.GREYSCALE,
        fg: ShadeId.S200LO,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S050HI,
      },
    ],
    $map(spec => ({...spec, isDark: true, isSecondary: false, isHighlight: false})),
    $asArray(),
);

export const SECONDARY_DARK_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {
        section: ColorSection.PASSIVE,
        fgType: ShadeType.GREYSCALE,
        fg: ShadeId.S200MH,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S050HI,
      },
      {
        section: ColorSection.ACTION,
        fgType: ShadeType.BASE,
        fg: ShadeId.S175HI,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S050HI,
      },
      {
        section: ColorSection.FOCUS,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.S050ML,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.HOVER,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.FCONTR,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.DISABLED,
        fgType: ShadeType.GREYSCALE,
        fg: ShadeId.S200LO,
        bgType: ShadeType.GREYSCALE,
        bg: ShadeId.S050HI,
      },
    ],
    $map(spec => ({...spec, isDark: true, isSecondary: true, isHighlight: false})),
    $asArray(),
);

export const PRIMARY_LIGHT_HIGHLIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {
        section: ColorSection.PASSIVE,
        fgType: ShadeType.BASE,
        fg: ShadeId.S010HI,
        bgType: ShadeType.BASE,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.ACTION,
        fgType: ShadeType.BASE,
        fg: ShadeId.CONTRA,
        bgType: ShadeType.BASE,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.FOCUS,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.S050HI,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.HOVER,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.CONTRA,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.DISABLED,
        fgType: ShadeType.BASE,
        fg: ShadeId.S010VL,
        bgType: ShadeType.BASE,
        bg: ShadeId.S175HI,
      },
    ],
    $map(spec => ({...spec, isDark: false, isSecondary: false, isHighlight: true})),
    $asArray(),
);

export const SECONDARY_LIGHT_HIGHLIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {
        section: ColorSection.PASSIVE,
        fgType: ShadeType.BASE,
        fg: ShadeId.S010ML,
        bgType: ShadeType.BASE,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.ACTION,
        fgType: ShadeType.BASE,
        fg: ShadeId.S050HI,
        bgType: ShadeType.BASE,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.FOCUS,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.S050ML,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.HOVER,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.FCONTR,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.DISABLED,
        fgType: ShadeType.BASE,
        fg: ShadeId.S010VL,
        bgType: ShadeType.BASE,
        bg: ShadeId.S175HI,
      },
    ],
    $map(spec => ({...spec, isDark: false, isSecondary: true, isHighlight: true})),
    $asArray(),
);

export const PRIMARY_DARK_HIGHLIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {
        section: ColorSection.PASSIVE,
        fgType: ShadeType.GREYSCALE,
        fg: ShadeId.S200HI,
        bgType: ShadeType.BASE,
        bg: ShadeId.S050HI,
      },
      {
        section: ColorSection.ACTION,
        fgType: ShadeType.BASE,
        fg: ShadeId.CONTRA,
        bgType: ShadeType.BASE,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.FOCUS,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.S050HI,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.HOVER,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.CONTRA,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.DISABLED,
        fgType: ShadeType.GREYSCALE,
        fg: ShadeId.S200LO,
        bgType: ShadeType.BASE,
        bg: ShadeId.S050HI,
      },
    ],
    $map(spec => ({...spec, isDark: true, isSecondary: false, isHighlight: true})),
    $asArray(),
);

export const SECONDARY_DARK_HIGHLIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {
        section: ColorSection.PASSIVE,
        fgType: ShadeType.GREYSCALE,
        fg: ShadeId.S200MH,
        bgType: ShadeType.BASE,
        bg: ShadeId.S050HI,
      },
      {
        section: ColorSection.ACTION,
        fgType: ShadeType.BASE,
        fg: ShadeId.S175HI,
        bgType: ShadeType.BASE,
        bg: ShadeId.S050HI,
      },
      {
        section: ColorSection.FOCUS,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.S050ML,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S175HI,
      },
      {
        section: ColorSection.HOVER,
        fgType: ShadeType.ACCENT,
        fg: ShadeId.FCONTR,
        bgType: ShadeType.ACCENT,
        bg: ShadeId.S100HI,
      },
      {
        section: ColorSection.DISABLED,
        fgType: ShadeType.GREYSCALE,
        fg: ShadeId.S200LO,
        bgType: ShadeType.BASE,
        bg: ShadeId.S050HI,
      },
    ],
    $map(spec => ({...spec, isDark: true, isSecondary: true, isHighlight: true})),
    $asArray(),
);
