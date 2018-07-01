import { ImmutableMap, ImmutableSet } from 'gs-tools/export/collect';
import { Alpha } from './alpha';
import { ColorSection } from './color-section';

export enum Shade {
  A100,
  B000,
  B010,
  B025,
  B050,
  B100,
  B125,
  B150,
  B175,
  B190,
  B200,
}

export const SHADES: ImmutableSet<Shade> = ImmutableSet.of([
  Shade.B000,
  Shade.B010,
  Shade.B025,
  Shade.B050,
  Shade.B100,
  Shade.B125,
  Shade.B150,
  Shade.B175,
  Shade.B190,
  Shade.B200,
]);

export interface ShadingSpec {
  alpha: Alpha;
  bg: Shade;
  fg: Shade|'contrast';
}

export const LIGHT_SHADING = ImmutableMap.of<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: Shade.B200, fg: Shade.B010}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: Shade.B200, fg: Shade.B010}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: Shade.B200, fg: Shade.B050}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: Shade.B200, fg: Shade.A100}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: Shade.B200, fg: Shade.B010}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: Shade.B175, fg: Shade.B050}],
  [ColorSection.ACTION_PRIMARY,          {alpha: Alpha.HIGH,   bg: Shade.B125, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_FOCUS,    {alpha: Alpha.HIGH,   bg: Shade.A100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_DISABLED, {alpha: Alpha.LOW,    bg: Shade.B200, fg: Shade.B010}],
]);

export const DARK_SHADING = ImmutableMap.of<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: Shade.B025, fg: Shade.B200}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: Shade.B025, fg: Shade.B200}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: Shade.B025, fg: Shade.B150}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: Shade.B025, fg: Shade.A100}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: Shade.B025, fg: Shade.B200}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: Shade.B175, fg: Shade.B050}],
  [ColorSection.ACTION_PRIMARY,          {alpha: Alpha.HIGH,   bg: Shade.B125, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_FOCUS,    {alpha: Alpha.HIGH,   bg: Shade.A100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_DISABLED, {alpha: Alpha.LOW,    bg: Shade.B025, fg: Shade.B200}],
]);

export const HIGHLIGHT_SHADING = ImmutableMap.of<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: Shade.B100, fg: 'contrast'}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: Shade.B100, fg: 'contrast'}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: Shade.B100, fg: 'contrast'}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: Shade.B100, fg: Shade.A100}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: Shade.B100, fg: 'contrast'}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: Shade.B175, fg: Shade.B050}],
]);
