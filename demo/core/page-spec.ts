import { ComponentSpec } from 'persona';
import { CustomElementCtrlCtor } from 'persona/export/internal';

import { $buttonDemo, ButtonDemo } from '../action/button';
import { $colors, Colors } from '../general/colors';
import { $texts, Texts } from '../general/texts';

import { Views } from './location-service';


export interface PageSpec {
  readonly ctor: CustomElementCtrlCtor;
  readonly componentSpec: ComponentSpec<any>;
  readonly name: string;
  readonly path: Views;
}

export const ACTION_SPECS: readonly PageSpec[] = [
  {ctor: ButtonDemo, componentSpec: $buttonDemo, name: 'Button', path: Views.BUTTON},
];

export const GENERAL_SPECS: readonly PageSpec[] = [
  {ctor: Colors, componentSpec: $colors, name: 'Colors', path: Views.COLORS},
  {ctor: Texts, componentSpec: $texts, name: 'Texts', path: Views.TEXT},
];

export const ALL_SPECS = [
  ...ACTION_SPECS,
  ...GENERAL_SPECS,
];

export function getPageSpec(searchedPath: Views): PageSpec|null {
  return ALL_SPECS.find(({path}) => path === searchedPath) || null;
}
