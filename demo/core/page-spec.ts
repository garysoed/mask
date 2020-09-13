import { ComponentSpec } from 'persona';
import { CustomElementCtrlCtor } from 'persona/export/internal';

import { $buttonDemo, ButtonDemo } from '../action/button';
import { $checkboxDemo, CheckboxDemo } from '../action/checkbox';
import { $colorsDemo, ColorsDemo } from '../general/colors';
import { $textsDemo, TextsDemo } from '../general/texts';

import { Views } from './location-service';
import { TextInputDemo, $textInputDemo } from '../action/text-input';


export interface PageSpec {
  readonly ctor: CustomElementCtrlCtor;
  readonly componentSpec: ComponentSpec<any>;
  readonly name: string;
  readonly path: Views;
}

export const ACTION_SPECS: readonly PageSpec[] = [
  {ctor: ButtonDemo, componentSpec: $buttonDemo, name: 'Button', path: Views.BUTTON},
  {ctor: CheckboxDemo, componentSpec: $checkboxDemo, name: 'Checkbox', path: Views.CHECKBOX},
  {ctor: TextInputDemo, componentSpec: $textInputDemo, name: 'Text input', path: Views.TEXT_INPUT},
];

export const GENERAL_SPECS: readonly PageSpec[] = [
  {ctor: ColorsDemo, componentSpec: $colorsDemo, name: 'Colors', path: Views.COLORS},
  {ctor: TextsDemo, componentSpec: $textsDemo, name: 'Texts', path: Views.TEXT},
];

export const ALL_SPECS = [
  ...ACTION_SPECS,
  ...GENERAL_SPECS,
];

export function getPageSpec(searchedPath: Views): PageSpec|null {
  return ALL_SPECS.find(({path}) => path === searchedPath) || null;
}
