import { $asArray, $map, $pipe } from 'gs-tools/export/collect';

import { ColorSection } from './color-section';
import { ShadeId } from './shade';

export interface SectionSpec {
  readonly isDark: boolean;
  readonly isHighlight: boolean;
  readonly isSecondary: boolean;
  readonly section: ColorSection;
  readonly isBase: boolean;
  readonly fg: ShadeId;
  readonly bg: ShadeId;
}

export const PRIMARY_LIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {section: ColorSection.PASSIVE,  isBase: true,  fg: ShadeId.S010HI, bg: ShadeId.S200HI},
      {section: ColorSection.ACTION,   isBase: true,  fg: ShadeId.CONTRA, bg: ShadeId.S100HI},
      {section: ColorSection.FOCUS,    isBase: false, fg: ShadeId.S050HI, bg: ShadeId.S175HI},
      {section: ColorSection.HOVER,    isBase: false, fg: ShadeId.CONTRA, bg: ShadeId.S100HI},
      {section: ColorSection.DISABLED, isBase: true,  fg: ShadeId.S010VL, bg: ShadeId.S200HI},
    ],
    $map(spec => ({...spec, isDark: false, isSecondary: false, isHighlight: false})),
    $asArray(),
);

export const SECONDARY_LIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {section: ColorSection.PASSIVE,  isBase: true,  fg: ShadeId.S010ML, bg: ShadeId.S200HI},
      {section: ColorSection.ACTION,   isBase: true,  fg: ShadeId.S050HI, bg: ShadeId.S200HI},
      {section: ColorSection.FOCUS,    isBase: false, fg: ShadeId.S050ML, bg: ShadeId.S175HI},
      {section: ColorSection.HOVER,    isBase: false, fg: ShadeId.FCONTR, bg: ShadeId.S100HI},
      {section: ColorSection.DISABLED, isBase: true,  fg: ShadeId.S010VL, bg: ShadeId.S200HI},
    ],
    $map(spec => ({...spec, isDark: false, isSecondary: true, isHighlight: false})),
    $asArray(),
);

export const PRIMARY_DARK_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {section: ColorSection.PASSIVE,  isBase: true,  fg: ShadeId.S200HI, bg: ShadeId.S000HI},
      {section: ColorSection.ACTION,   isBase: true,  fg: ShadeId.CONTRA, bg: ShadeId.S100HI},
      {section: ColorSection.FOCUS,    isBase: false, fg: ShadeId.S050HI, bg: ShadeId.S175HI},
      {section: ColorSection.HOVER,    isBase: false, fg: ShadeId.CONTRA, bg: ShadeId.S100HI},
      {section: ColorSection.DISABLED, isBase: true,  fg: ShadeId.S200LO, bg: ShadeId.S000HI},
    ],
    $map(spec => ({...spec, isDark: true, isSecondary: false, isHighlight: false})),
    $asArray(),
);

export const SECONDARY_DARK_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {section: ColorSection.PASSIVE,  isBase: true,  fg: ShadeId.S200MH, bg: ShadeId.S000HI},
      {section: ColorSection.ACTION,   isBase: true,  fg: ShadeId.S175HI, bg: ShadeId.S000HI},
      {section: ColorSection.FOCUS,    isBase: false, fg: ShadeId.S050ML, bg: ShadeId.S175HI},
      {section: ColorSection.HOVER,    isBase: false, fg: ShadeId.FCONTR, bg: ShadeId.S100HI},
      {section: ColorSection.DISABLED, isBase: true,  fg: ShadeId.S200LO, bg: ShadeId.S000HI},
    ],
    $map(spec => ({...spec, isDark: true, isSecondary: true, isHighlight: false})),
    $asArray(),
);

export const PRIMARY_LIGHT_HIGHLIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {section: ColorSection.PASSIVE,  isBase: true,  fg: ShadeId.S010HI, bg: ShadeId.S175HI},
      {section: ColorSection.ACTION,   isBase: true,  fg: ShadeId.CONTRA, bg: ShadeId.S100HI},
      {section: ColorSection.FOCUS,    isBase: false, fg: ShadeId.S050HI, bg: ShadeId.S175HI},
      {section: ColorSection.HOVER,    isBase: false, fg: ShadeId.CONTRA, bg: ShadeId.S100HI},
      {section: ColorSection.DISABLED, isBase: true,  fg: ShadeId.S010VL, bg: ShadeId.S175HI},
    ],
    $map(spec => ({...spec, isDark: false, isSecondary: false, isHighlight: true})),
    $asArray(),
);

export const SECONDARY_LIGHT_HIGHLIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {section: ColorSection.PASSIVE,  isBase: true,  fg: ShadeId.S010ML, bg: ShadeId.S175HI},
      {section: ColorSection.ACTION,   isBase: true,  fg: ShadeId.S050HI, bg: ShadeId.S175HI},
      {section: ColorSection.FOCUS,    isBase: false, fg: ShadeId.S050ML, bg: ShadeId.S175HI},
      {section: ColorSection.HOVER,    isBase: false, fg: ShadeId.FCONTR, bg: ShadeId.S100HI},
      {section: ColorSection.DISABLED, isBase: true,  fg: ShadeId.S010VL, bg: ShadeId.S175HI},
    ],
    $map(spec => ({...spec, isDark: false, isSecondary: true, isHighlight: true})),
    $asArray(),
);

export const PRIMARY_DARK_HIGHLIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {section: ColorSection.PASSIVE,  isBase: true,  fg: ShadeId.S200HI, bg: ShadeId.S050HI},
      {section: ColorSection.ACTION,   isBase: true,  fg: ShadeId.CONTRA, bg: ShadeId.S100HI},
      {section: ColorSection.FOCUS,    isBase: false, fg: ShadeId.S050HI, bg: ShadeId.S175HI},
      {section: ColorSection.HOVER,    isBase: false, fg: ShadeId.CONTRA, bg: ShadeId.S100HI},
      {section: ColorSection.DISABLED, isBase: true,  fg: ShadeId.S200LO, bg: ShadeId.S050HI},
    ],
    $map(spec => ({...spec, isDark: true, isSecondary: false, isHighlight: true})),
    $asArray(),
);

export const SECONDARY_DARK_HIGHLIGHT_SECTION_SPECS: readonly SectionSpec[] = $pipe(
    [
      {section: ColorSection.PASSIVE,  isBase: true,  fg: ShadeId.S200MH, bg: ShadeId.S050HI},
      {section: ColorSection.ACTION,   isBase: true,  fg: ShadeId.S175HI, bg: ShadeId.S050HI},
      {section: ColorSection.FOCUS,    isBase: false, fg: ShadeId.S050ML, bg: ShadeId.S175HI},
      {section: ColorSection.HOVER,    isBase: false, fg: ShadeId.FCONTR, bg: ShadeId.S100HI},
      {section: ColorSection.DISABLED, isBase: true,  fg: ShadeId.S200LO, bg: ShadeId.S050HI},
    ],
    $map(spec => ({...spec, isDark: true, isSecondary: true, isHighlight: true})),
    $asArray(),
);
