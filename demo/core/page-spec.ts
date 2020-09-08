import { ComponentSpec } from 'persona';
import { CustomElementCtrlCtor } from 'persona/export/internal';
import { UnconvertedSpec } from 'persona/src/main/api';

import { $colors, Colors } from '../general/colors';

import { Views } from './location-service';


export interface PageSpec {
  readonly ctor: CustomElementCtrlCtor;
  readonly componentSpec: ComponentSpec<UnconvertedSpec>;
  readonly name: string;
  readonly path: Views;
}

export const GENERAL_SPECS: readonly PageSpec[] = [
  {ctor: Colors, componentSpec: $colors, name: 'Colors', path: Views.COLORS},
];

export function getPageSpec(searchedPath: Views): PageSpec|null {
  return GENERAL_SPECS.find(({path}) => path === searchedPath) || null;
}
