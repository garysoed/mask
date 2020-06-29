import { Alpha } from './alpha';
import { ColorSection } from './color-section';
import { B000, B010, B025, B050, B075, B100, B175, B200, Shade } from './shade';

export interface ShadingSpec {
  accent: boolean;
  bg: Shade;
  primary: Alpha;
  secondary: Alpha;
  shade: Shade|'contrast';
}

export const LIGHT_SHADING = new Map<ColorSection, ShadingSpec>([
  [
    ColorSection.PASSIVE,
    {bg: B200, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B010},
  ],
  [
    ColorSection.ACTION,
    {bg: B200, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B050},
  ],
  [
    ColorSection.ACTION_FOCUS,
    {bg: B175, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B050},
  ],
  [
    ColorSection.ACTION_DISABLED,
    {bg: B200, accent: false, primary: Alpha.LOW, secondary: Alpha.LOW, shade: B010},
  ],
  [
    ColorSection.ACTIVE,
    {bg: B175, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B050},
  ],
  [
    ColorSection.ACTION_PRIMARY,
    {bg: B100, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: 'contrast'},
  ],
  [
    ColorSection.ACTION_PRIMARY_FOCUS,
    {bg: B100, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: 'contrast'},
  ],
  [
    ColorSection.ACTION_PRIMARY_DISABLED,
    {bg: B200, accent: false, primary: Alpha.LOW, secondary: Alpha.LOW, shade: B010},
  ],
]);

export const DARK_SHADING = new Map<ColorSection, ShadingSpec>([
  [
    ColorSection.PASSIVE,
    {bg: B025, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B200},
  ],
  [
    ColorSection.ACTION,
    {bg: B025, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B175},
  ],
  [
    ColorSection.ACTION_FOCUS,
    {bg: B075, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B175},
  ],
  [
    ColorSection.ACTION_DISABLED,
    {bg: B025, accent: false, primary: Alpha.LOW, secondary: Alpha.LOW, shade: B200},
  ],
  [
    ColorSection.ACTIVE,
    {bg: B075, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B175},
  ],
  [
    ColorSection.ACTION_PRIMARY,
    {bg: B100, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: 'contrast'},
  ],
  [
    ColorSection.ACTION_PRIMARY_FOCUS,
    {bg: B100, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: 'contrast'},
  ],
  [
    ColorSection.ACTION_PRIMARY_DISABLED,
    {bg: B025, accent: false, primary: Alpha.LOW, secondary: Alpha.LOW, shade: B200},
  ],
]);

export const HIGHLIGHT_LIGHT_SHADING = new Map<ColorSection, ShadingSpec>([
  [
    ColorSection.PASSIVE,
    {bg: B175, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B010},
  ],
  [
    ColorSection.ACTION,
    {bg: B175, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B050},
  ],
  [
    ColorSection.ACTION_FOCUS,
    {bg: B175, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B050},
  ],
  [
    ColorSection.ACTION_DISABLED,
    {bg: B175, accent: false, primary: Alpha.LOW, secondary: Alpha.LOW, shade: B010},
  ],
  [
    ColorSection.ACTIVE,
    {bg: B175, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B050},
  ],
  [
    ColorSection.ACTION_PRIMARY,
    {bg: B100, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: 'contrast'},
  ],
  [
    ColorSection.ACTION_PRIMARY_FOCUS,
    {bg: B100, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: 'contrast'},
  ],
  [
    ColorSection.ACTION_PRIMARY_DISABLED,
    {bg: B175, accent: false, primary: Alpha.LOW, secondary: Alpha.LOW, shade: B010},
  ],
]);

export const HIGHLIGHT_DARK_SHADING = new Map<ColorSection, ShadingSpec>([
  [
    ColorSection.PASSIVE,
    {bg: B075, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B200},
  ],
  [
    ColorSection.ACTION,
    {bg: B075, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B175},
  ],
  [
    ColorSection.ACTION_FOCUS,
    {bg: B075, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B175},
  ],
  [
    ColorSection.ACTION_DISABLED,
    {bg: B075, accent: false, primary: Alpha.LOW, secondary: Alpha.LOW, shade: B200},
  ],
  [
    ColorSection.ACTIVE,
    {bg: B075, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: B175},
  ],
  [
    ColorSection.ACTION_PRIMARY,
    {bg: B100, accent: false, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: 'contrast'},
  ],
  [
    ColorSection.ACTION_PRIMARY_FOCUS,
    {bg: B100, accent: true, primary: Alpha.HIGH, secondary: Alpha.MEDIUM, shade: 'contrast'},
  ],
  [
    ColorSection.ACTION_PRIMARY_DISABLED,
    {bg: B075, accent: false, primary: Alpha.LOW, secondary: Alpha.LOW, shade: B175},
  ],
]);
