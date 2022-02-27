import {enumType} from 'gs-types';

import {ColorLocation, ColorSection, MixType, Palette, Shade, ThemeSubtype, ThemeMode, ThemeContext} from './const';


export const SPECS_RAW = new Map([
  [
    ThemeMode.LIGHT,
    new Map([
      [
        ColorSection.PASSIVE,
        new Map([
          [ThemeContext.MAIN, ['P010-P195', 'P010ml-P195']],
          [ThemeContext.SIDE, ['P010-P180', 'P010ml-P180']],
          [ThemeContext.HIGHLIGHT, ['P010-A175', 'P010ml-A175']],
        ]),
      ],
      [
        ColorSection.ACTION,
        new Map([
          [ThemeContext.MAIN, ['Pk-A100', 'A050-P195']],
          [ThemeContext.SIDE, ['Pk-A100', 'A050-P180']],
          [ThemeContext.HIGHLIGHT, ['Pk-A100', 'A050-A175']],
        ]),
      ],
      [
        ColorSection.FOCUS,
        new Map([
          [ThemeContext.MAIN, ['H050-H175', 'H050ml-H175']],
          [ThemeContext.SIDE, ['H050-H175', 'H050ml-H175']],
          [ThemeContext.HIGHLIGHT, ['H050-H175', 'H050ml-H175']],
        ]),
      ],
      [
        ColorSection.HOVER,
        new Map([
          [ThemeContext.MAIN, ['Hk-H100', 'Hc-H100']],
          [ThemeContext.SIDE, ['Hk-H100', 'Hc-H100']],
          [ThemeContext.HIGHLIGHT, ['Hk-H100', 'Hc-H100']],
        ]),
      ],
      [
        ColorSection.DISABLED,
        new Map([
          [ThemeContext.MAIN, ['P010vl-P195', 'P010vl-P195']],
          [ThemeContext.SIDE, ['P010vl-P180', 'P010vl-P180']],
          [ThemeContext.HIGHLIGHT, ['P010vl-A175', 'P010vl-A175']],
        ]),
      ],
    ]),
  ],
  [
    ThemeMode.DARK,
    new Map([
      [
        ColorSection.PASSIVE,
        new Map([
          [ThemeContext.MAIN, ['P200-P035', 'P200mh-P035']],
          [ThemeContext.SIDE, ['P200-P050', 'P200mh-P050']],
          [ThemeContext.HIGHLIGHT, ['P200-A045', 'P200mh-A045']],
        ]),
      ],
      [
        ColorSection.ACTION,
        new Map([
          [ThemeContext.MAIN, ['Pk-A100', 'A175-P035']],
          [ThemeContext.SIDE, ['Pk-A100', 'A175-P050']],
          [ThemeContext.HIGHLIGHT, ['Pk-A100', 'A175-A045']],
        ]),
      ],
      [
        ColorSection.FOCUS,
        new Map([
          [ThemeContext.MAIN, ['H050-H175', 'H050ml-H175']],
          [ThemeContext.SIDE, ['H050-H175', 'H050ml-H175']],
          [ThemeContext.HIGHLIGHT, ['H050-H175', 'H050ml-H175']],
        ]),
      ],
      [
        ColorSection.HOVER,
        new Map([
          [ThemeContext.MAIN, ['Hk-H100', 'Hc-H100']],
          [ThemeContext.SIDE, ['Hk-H100', 'Hc-H100']],
          [ThemeContext.HIGHLIGHT, ['Hk-H100', 'Hc-H100']],
        ]),
      ],
      [
        ColorSection.DISABLED,
        new Map([
          [ThemeContext.MAIN, ['P200lo-P035', 'P200lo-P035']],
          [ThemeContext.SIDE, ['P200lo-P050', 'P200lo-P050']],
          [ThemeContext.HIGHLIGHT, ['P200lo-A045', 'P200lo-A045']],
        ]),
      ],
    ]),
  ],
]);

const PALETTE_TYPE = enumType<Palette>(Palette);

type SectionSpecs = ReadonlyMap<string, Shade>;

function createId(
    type: ThemeMode,
    subtype: ThemeSubtype,
    context: ThemeContext,
    section: ColorSection,
    location: ColorLocation,
): string {
  return `${type}-${subtype}-${context}-${section}-${location}`;
}

function parseAlpha(raw: string|undefined): number {
  switch (raw) {
    case 'mh':
      return 0.75;
    case 'ml':
      return 0.65;
    case 'lo':
      return 0.45;
    case 'vl':
      return 0.35;
    default:
      return 1;
  }
}

function parseMix(raw: string): MixType {
  if (raw === 'c' || raw === 'k') {
    return 'c';
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid mix: ${raw}`);
  }

  return parsed;
}

const REGEX = /(P|H|A)(\d\d\d|c|k)(mh|ml|lo|vl)?/;
function parseShade(raw: string): Shade {
  const matches = raw.match(REGEX);
  if (!matches) {
    throw new Error(`Invalid shades spec ${raw}`);
  }

  const [, palette, mixRaw, alphaRaw] = matches;
  if (!PALETTE_TYPE.check(palette)) {
    throw new Error(`Invalid palette type in ${raw}`);
  }

  palette;

  const mix = parseMix(mixRaw);
  const alpha = mixRaw === 'c' ? 'c' : parseAlpha(alphaRaw);
  return {palette, mix, alpha};
}


const PARSED = (function(): SectionSpecs {
  const sectionSpecs = new Map();
  for (const [themeType, specs] of SPECS_RAW) {
    for (const [section, contexts] of specs) {
      for (const [context, [primary, secondary]] of contexts) {
        const [primaryRawFg, primaryRawBg] = primary.split('-');
        sectionSpecs.set(
            createId(themeType, ThemeSubtype.PRIMARY, context, section, ColorLocation.FOREGROUND),
            parseShade(primaryRawFg),
        );
        sectionSpecs.set(
            createId(themeType, ThemeSubtype.PRIMARY, context, section, ColorLocation.BACKGROUND),
            parseShade(primaryRawBg),
        );

        const [secondaryRawFg, secondaryRawBg] = secondary.split('-');
        sectionSpecs.set(
            createId(themeType, ThemeSubtype.SECONDARY, context, section, ColorLocation.FOREGROUND),
            parseShade(secondaryRawFg),
        );
        sectionSpecs.set(
            createId(themeType, ThemeSubtype.SECONDARY, context, section, ColorLocation.BACKGROUND),
            parseShade(secondaryRawBg),
        );
      }
    }
  }
  return sectionSpecs;
})();

export function getShade(
    type: ThemeMode,
    subtype: ThemeSubtype,
    context: ThemeContext,
    section: ColorSection,
    location: ColorLocation,
): Shade {
  const id = createId(type, subtype, context, section, location);
  const shade = PARSED.get(id);
  if (!shade) {
    throw new Error(`Shade for ${id} not found`);
  }

  return shade;
}
