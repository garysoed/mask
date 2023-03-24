import {Color, HslColor} from 'gs-tools/export/color';
import {cache} from 'gs-tools/export/data';
import {Cases} from 'gs-tools/export/string';
import {getAllValues} from 'gs-tools/export/typescript';

import {ColorLocation, ColorSection, Palette, ThemeSubtype, ThemeMode, ThemeContext} from './const';
import generalCss from './general.css';
import {getShade} from './section-spec';
import {ColorWithAlpha, getColors} from './shade';


interface ThemeInput {
  readonly baseSeed: Color;
  readonly accentSeed: Color;
  readonly mode: ThemeMode;
}

export class Theme {
  constructor(private readonly input: ThemeInput) { }

  get accentSeed(): Color {
    return this.input.accentSeed;
  }

  get baseSeed(): Color {
    return this.input.baseSeed;
  }

  generateCss(): string {
    const cssDeclarations = [
      this.generateRootThemeCss(),
      ...getAllValues<ThemeContext>(ThemeContext).map(context => this.generateContextCss(context)),
    ];

    return `${cssDeclarations.join('\n\n')}\n${generalCss}`;
  }

  private generateRootThemeCss(): string {
    const variables = [];
    for (const context of getAllValues<ThemeContext>(ThemeContext)) {
      for (const subtype of getAllValues<ThemeSubtype>(ThemeSubtype)) {
        for (const section of getAllValues<ColorSection>(ColorSection)) {
          const fgName = getSectionVariableName(
              subtype,
              section, ColorLocation.
                  FOREGROUND,
              context,
          );
          const bgName = getSectionVariableName(
              subtype,
              section,
              ColorLocation.BACKGROUND,
              context,
          );
          const {foreground, background} = getColors(
              getShade(this.input.mode, subtype, context, section, ColorLocation.FOREGROUND),
              getShade(this.input.mode, subtype, context, section, ColorLocation.BACKGROUND),
              this.paletteBaseColorMap,
          );

          variables.push(
              `${fgName}: ${generateCssColor(foreground)};`,
              `${bgName}: ${generateCssColor(background)};`,
          );
        }
      }
    }

    return `:root { ${variables.join('\n')} }`;
  }

  private generateContextCss(context: ThemeContext): string {
    const variables = [];
    for (const subtype of getAllValues<ThemeSubtype>(ThemeSubtype)) {
      for (const section of getAllValues<ColorSection>(ColorSection)) {
        const fgName = getSectionVariableName(subtype, section, ColorLocation.FOREGROUND);
        const fgNameLevel = getSectionVariableName(
            subtype,
            section,
            ColorLocation.FOREGROUND,
            context,
        );
        const bgName = getSectionVariableName(subtype, section, ColorLocation.BACKGROUND);
        const bgNameLevel = getSectionVariableName(
            subtype,
            section,
            ColorLocation.BACKGROUND,
            context,
        );

        variables.push(
            `${fgName}: var(${fgNameLevel});`,
            `${bgName}: var(${bgNameLevel});`,
        );
      }
    }

    return `[mk-theme-context="${context}"] { ${variables.join('\n')} }`;
  }

  @cache()
  get paletteBaseColorMap(): ReadonlyMap<Palette, Color> {
    const passive = new HslColor(
        this.input.baseSeed.hue,
        this.input.baseSeed.saturation * 0.2,
        this.input.baseSeed.lightness,
    );

    return new Map([
      [Palette.PASSIVE, passive],
      [Palette.HIGHLIGHT, this.input.accentSeed],
      [Palette.ACTION, this.input.baseSeed],
    ]);
  }
}

function getSectionVariableName(
    subtype: ThemeSubtype,
    section: ColorSection,
    location: ColorLocation,
    context?: ThemeContext,
): string {
  const segments = [ '--mkTheme'];
  if (context) {
    segments.push(Cases.of(context).toPascalCase());
  }

  segments.push(
      Cases.of(section).toPascalCase(),
      location.toUpperCase(),
      subtype,
  );
  return segments.join('');
}

function generateCssColor({color, alpha}: ColorWithAlpha): string {
  return `rgba(${color.red},${color.green},${color.blue},${alpha})`;
}
