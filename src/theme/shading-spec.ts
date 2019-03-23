import { createImmutableMap } from 'gs-tools/export/collect';
import { Alpha } from './alpha';
import { ColorSection } from './color-section';
import { B000, B010, B050, B075, B100, B175, B200, Shade } from './shade';

export interface ShadingSpec {
  alpha: Alpha;
  bg: Shade;
  fg: Shade|'contrast';
}

export const LIGHT_SHADING = createImmutableMap<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: B200, fg: B010}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: B200, fg: B010}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: B200, fg: B050}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: B175, fg: B050}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: B200, fg: B010}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: B175, fg: B050}],
  [ColorSection.ACTION_PRIMARY,          {alpha: Alpha.HIGH,   bg: B100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_FOCUS,    {alpha: Alpha.HIGH,   bg: B100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_DISABLED, {alpha: Alpha.LOW,    bg: B200, fg: B010}],
]);

export const DARK_SHADING = createImmutableMap<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: B000, fg: B200}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: B000, fg: B200}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: B000, fg: B175}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: B075, fg: B175}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: B000, fg: B200}],
  [ColorSection.ACTIVE,                  {alpha: Alpha.HIGH,   bg: B075, fg: B175}],
  [ColorSection.ACTION_PRIMARY,          {alpha: Alpha.HIGH,   bg: B100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_FOCUS,    {alpha: Alpha.HIGH,   bg: B100, fg: 'contrast'}],
  [ColorSection.ACTION_PRIMARY_DISABLED, {alpha: Alpha.LOW,    bg: B000, fg: B200}],
]);

export const HIGHLIGHT_SHADING = createImmutableMap<ColorSection, ShadingSpec>([
  [ColorSection.PASSIVE,                 {alpha: Alpha.HIGH,   bg: B100, fg: 'contrast'}],
  [ColorSection.SECONDARY,               {alpha: Alpha.MEDIUM, bg: B100, fg: 'contrast'}],
  [ColorSection.ACTION,                  {alpha: Alpha.HIGH,   bg: B100, fg: 'contrast'}],
  [ColorSection.ACTION_FOCUS,            {alpha: Alpha.HIGH,   bg: B100, fg: 'contrast'}],
  [ColorSection.ACTION_DISABLED,         {alpha: Alpha.LOW,    bg: B100, fg: 'contrast'}],
]);
