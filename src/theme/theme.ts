import { $declareKeyed, $getKey, $head, $map, $pick, $pipe, asImmutableMap, ImmutableMap } from '@gs-tools/collect';
import { Color, Colors } from '@gs-tools/color';
import { assertUnreachable, Enums } from '@gs-tools/typescript';
import { Alpha } from './alpha';
import { ColorSection } from './color-section';
import * as generalCss from './general.css';
import { B010, B100, B190, BASE_SHADES, createColor, Shade } from './shade';
import { DARK_SHADING, HIGHLIGHT_DARK_SHADING, HIGHLIGHT_LIGHT_SHADING, LIGHT_SHADING, ShadingSpec } from './shading-spec';
import * as variablesCssTemplate from './variables.css';


function generateColorCss_(
    colorMap: ImmutableMap<ColorSection, {alpha: number; bg: Color; fg: Color}>,
    highlightColorMap: ImmutableMap<ColorSection, {alpha: number; bg: Color; fg: Color}>,
): string {
  const lines = [];
  for (const [section, {alpha, bg, fg}] of colorMap) {
    lines.push(`--mkTheme${section}BG: rgb(${bg.getRed()},${bg.getGreen()},${bg.getBlue()});`);
    lines.push(
        `--mkTheme${section}FG: rgba(${fg.getRed()},${fg.getGreen()},${fg.getBlue()},${alpha});`);
  }

  for (const [section, {alpha, bg, fg}] of highlightColorMap) {
    lines.push(
        `--mkThemeHighlight${section}BG: rgb(${bg.getRed()},${bg.getGreen()},${bg.getBlue()});`);
    lines.push(`--mkThemeHighlight${section}FG:` +
        ` rgba(${fg.getRed()},${fg.getGreen()},${fg.getBlue()},${alpha});`);
  }

  return lines.join('\n');
}

function generateColorMap_(
    map: ImmutableMap<ColorSection, ShadingSpec>,
    baseColors: ImmutableMap<Shade, Color>,
    accentColors: ImmutableMap<Shade, Color>,
    contrastBaseShade: Shade,
    contrastAccentShade: Shade,
): ImmutableMap<ColorSection, {alpha: number; bg: Color; fg: Color}> {
  return $pipe(
      map,
      $map(
          (([section, {alpha, bg, fg}]) => {
            const useAccent = section === ColorSection.ACTION_FOCUS ||
                section === ColorSection.ACTION_PRIMARY_FOCUS;
            const map = useAccent ? accentColors : baseColors;
            const contrast = useAccent ? contrastAccentShade : contrastBaseShade;
            const normalizedFg = fg === 'contrast' ? contrast : fg;

            const fgColor = $pipe(map, $getKey(normalizedFg), $pick(1), $head());
            if (!fgColor) {
              throw new Error(`Color for shade ${normalizedFg} cannot be found`);
            }

            const bgColor = $pipe(map, $getKey(bg), $pick(1), $head());
            if (!bgColor) {
              throw new Error(`Color for shade ${bg} cannot be found`);
            }

            const numericAlpha = getAlphaValue_(alpha, normalizedFg);

            return [section, {
              alpha: numericAlpha,
              bg: bgColor,
              fg: fgColor,
            }] as [ColorSection, {alpha: number; bg: Color; fg: Color}];
          }),
      ),
      asImmutableMap(),
  );
}

function getAlphaValue_(alpha: Alpha, colorShade: Shade): number {
  if (alpha === Alpha.HIGH) {
    return 1;
  }

  switch (colorShade) {
    case B010:
      switch (alpha) {
        case Alpha.MEDIUM:
          return 0.65;
        case Alpha.LOW:
          return 0.35;
        default:
          assertUnreachable(alpha);
      }
    case B190:
      switch (alpha) {
        case Alpha.MEDIUM:
          return 0.75;
        case Alpha.LOW:
          return 0.45;
        default:
          assertUnreachable(alpha);
      }
    default:
      throw new Error(`Unsupported color shade for alpha: ${colorShade}`);
  }
}

function getContrastForegroundShade_(
    shadingMap: ImmutableMap<Shade, Color>,
    highlightBackground: Color): Shade {
  const darkShade = B010;
  const lightShade = B190;
  const darkForeground = $pipe(shadingMap, $getKey(darkShade), $pick(1), $head());
  const lightForeground = $pipe(shadingMap, $getKey(lightShade), $pick(1), $head());

  if (!darkForeground) {
    throw new Error(`Cannot find color for ${darkShade}`);
  }

  if (!lightForeground) {
    throw new Error(`Cannot find color for ${lightShade}`);
  }

  const darkContrast = Colors.getContrast(darkForeground, highlightBackground);
  const lightContrast = Colors.getContrast(lightForeground, highlightBackground);

  return darkContrast > lightContrast ? darkShade : lightShade;
}


export class Theme {
  constructor(
      readonly baseColor: Color,
      readonly highlightColor: Color) { }

  injectCss(styleEl: HTMLStyleElement): void {
    const baseColorPairs = $pipe(
        BASE_SHADES,
        $map(shade => [shade, createColor(shade, this.baseColor)] as [Shade, Color]),
        $declareKeyed(([key]) => key),
        asImmutableMap(),
    );
    const accentColorPairs = $pipe(
        BASE_SHADES,
        $map(shade => [shade, createColor(shade, this.highlightColor)] as [Shade, Color]),
        $declareKeyed(([key]) => key),
        asImmutableMap(),
    );

    const baseB100 = $pipe(baseColorPairs, $getKey(B100), $pick(1), $head());
    if (!baseB100) {
      throw new Error(`Base color does not exist`);
    }
    const accentB100 = $pipe(accentColorPairs, $getKey(B100), $pick(1), $head());
    if (!accentB100) {
      throw new Error('Accent color does not exist');
    }

    const contrastBaseShade = getContrastForegroundShade_(baseColorPairs, baseB100);
    const contrastAccentShade = getContrastForegroundShade_(accentColorPairs, accentB100);
    const lightColorMap = generateColorMap_(
        LIGHT_SHADING,
        baseColorPairs,
        accentColorPairs,
        contrastBaseShade,
        contrastAccentShade,
    );
    const darkColorMap = generateColorMap_(
        DARK_SHADING,
        baseColorPairs,
        accentColorPairs,
        contrastBaseShade,
        contrastAccentShade,
    );
    const highlightLightColorMap = generateColorMap_(
        HIGHLIGHT_LIGHT_SHADING,
        baseColorPairs,
        accentColorPairs,
        contrastBaseShade,
        contrastAccentShade,
    );
    const highlightDarkColorMap = generateColorMap_(
        HIGHLIGHT_DARK_SHADING,
        baseColorPairs,
        accentColorPairs,
        contrastBaseShade,
        contrastAccentShade,
    );
    const cssContent = variablesCssTemplate
        .replace('/*{themeLight}*/', generateColorCss_(lightColorMap, highlightLightColorMap))
        .replace('/*{themeDark}*/', generateColorCss_(darkColorMap, highlightDarkColorMap))
        .replace(
            '/*{themeHighlightLight}*/',
            generateColorCss_(highlightLightColorMap, lightColorMap),
        )
        .replace(
            '/*{themeHighlightDark}*/',
            generateColorCss_(highlightDarkColorMap, darkColorMap),
        )
        .replace(
            '/*{themeHighlightSwitch}*/',
            generateHighlightSwitch(),
        );

    styleEl.innerHTML = `${cssContent}\n${generalCss}`;
  }

  setBaseColor(color: Color): Theme {
    return new Theme(color, this.highlightColor);
  }

  setHighlightColor(color: Color): Theme {
    return new Theme(this.baseColor, color);
  }
}

function generateHighlightSwitch(): string {
  const sections: string[] = [];
  for (const section of Enums.getAllValues(ColorSection)) {
    sections.push(`--mkTheme${section}FG: var(--mkThemeHighlight${section}FG);`);
    sections.push(`--mkTheme${section}BG: var(--mkThemeHighlight${section}BG);`);
  }

  return sections.join('\n');
}
