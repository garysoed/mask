import { ComponentSpec } from 'persona';
import { CustomElementCtrlCtor } from 'persona/export/internal';

import { $buttonDemo, ButtonDemo } from '../action/button';
import { $checkboxDemo, CheckboxDemo } from '../action/checkbox';
import { $radioInputDemo, RadioInputDemo } from '../action/radio-input';
import { $textInputDemo, TextInputDemo } from '../action/text-input';
import { $iconDemo, IconDemo } from '../display/icon';
import { $colorsDemo, ColorsDemo } from '../general/colors';
import { $textsDemo, TextsDemo } from '../general/texts';

import { Views } from './location-service';


export interface PageSpec {
  readonly ctor: CustomElementCtrlCtor;
  readonly componentSpec: ComponentSpec<any>;
  readonly name: string;
  readonly path: Views;
}

export const ACTION_SPECS: readonly PageSpec[] = [
  {ctor: ButtonDemo, componentSpec: $buttonDemo, name: 'Button', path: Views.BUTTON},
  {ctor: CheckboxDemo, componentSpec: $checkboxDemo, name: 'Checkbox', path: Views.CHECKBOX},
  {
    ctor: RadioInputDemo,
    componentSpec: $radioInputDemo,
    name: 'Radio input',
    path: Views.RADIO_INPUT,
  },
  {ctor: TextInputDemo, componentSpec: $textInputDemo, name: 'Text input', path: Views.TEXT_INPUT},
];

export const DISPLAY_SPECS: readonly PageSpec[] = [
  {ctor: IconDemo, componentSpec: $iconDemo, name: 'Icon', path: Views.ICON},
];

export const GENERAL_SPECS: readonly PageSpec[] = [
  {ctor: ColorsDemo, componentSpec: $colorsDemo, name: 'Colors', path: Views.COLORS},
  {ctor: TextsDemo, componentSpec: $textsDemo, name: 'Texts', path: Views.TEXT},
];

export const ALL_SPECS = [
  ...ACTION_SPECS,
  ...DISPLAY_SPECS,
  ...GENERAL_SPECS,
];

export function getPageSpec(searchedPath: Views): PageSpec|null {
  return ALL_SPECS.find(({path}) => path === searchedPath) || null;
}
