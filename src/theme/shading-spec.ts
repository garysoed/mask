import { Alpha } from './alpha';
import { Shade } from './shade';

export interface ShadingSpec {
  accent: boolean;
  bg: Shade;
  primary: Alpha;
  secondary: Alpha;
  shade: Shade|'contrast';
}
