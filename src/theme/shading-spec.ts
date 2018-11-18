import { ImmutableMap } from 'gs-tools/export/collect';
import { Alpha } from './alpha';
import { ColorSection } from './color-section';
import { A050, A100, A175, B010, B025, B050, B100, B125, B150, B175, B200, Shade } from './shade';

export interface ShadingSpec {
  alpha: Alpha;
  bg: Shade;
  fg: Shade|'contrast';
}

export const LIGHT_SHADING = ImmutableMap.of<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: B200, fg: B010}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: B200, fg: B010}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: B200, fg: B050}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: B200, fg: A100}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: B200, fg: B010}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: B175, fg: B050}],
  [ColorSection.ACTION_PRIMARY,          {alpha: Alpha.HIGH,   bg: B125, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_FOCUS,    {alpha: Alpha.HIGH,   bg: A100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_DISABLED, {alpha: Alpha.LOW,    bg: B200, fg: B010}],
]);

export const DARK_SHADING = ImmutableMap.of<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: B025, fg: B200}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: B025, fg: B200}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: B025, fg: B150}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: B025, fg: A100}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: B025, fg: B200}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: B175, fg: B050}],
  [ColorSection.ACTION_PRIMARY,          {alpha: Alpha.HIGH,   bg: B125, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_FOCUS,    {alpha: Alpha.HIGH,   bg: A100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_DISABLED, {alpha: Alpha.LOW,    bg: B025, fg: B200}],
]);

export const HIGHLIGHT_SHADING = ImmutableMap.of<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: B100, fg: 'contrast'}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: B100, fg: 'contrast'}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: B100, fg: 'contrast'}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: B100, fg: A100}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: B100, fg: 'contrast'}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: B175, fg: B050}],
]);
