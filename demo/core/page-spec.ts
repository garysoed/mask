import {enumType, hasPropertiesType, instanceofType, stringType} from 'gs-types';
import {CustomElementRegistration} from 'persona';

import {BUTTON_DEMO} from '../action/button';
import {CHECKBOX_DEMO} from '../action/checkbox';
import {NUMBER_INPUT_DEMO} from '../action/number-input';
import {RADIO_INPUT_DEMO} from '../action/radio-input';
import {SELECT_INPUT_DEMO} from '../action/select-input';
import {TEXT_INPUT_DEMO} from '../action/text-input';
import {ANNOTATED_TEXT_DEMO} from '../display/annotated-text';
import {CODE_BLOCK_DEMO} from '../display/code-block';
import {ICON_DEMO} from '../display/icon';
import {KEYBOARD_DEMO} from '../display/keyboard';
import {COLORS_DEMO} from '../general/colors';
import {TEXTS_DEMO} from '../general/texts';
import {DRAWER_LAYOUT_DEMO} from '../layout/drawer-layout';
import {OVERLAY_LAYOUT_DEMO} from '../layout/overlay-layout';

import {Views} from './location-service';


export interface PageSpec {
  readonly registration: CustomElementRegistration<HTMLElement, any>;
  readonly name: string;
  readonly path: Views;
}

export const PAGE_SPEC_TYPE = hasPropertiesType({
  registration: instanceofType<CustomElementRegistration<HTMLElement, any>>(Object),
  name: stringType,
  path: enumType<Views>(Views),
});

export const ACTION_SPECS: readonly PageSpec[] = [
  {registration: BUTTON_DEMO, name: 'Button', path: Views.BUTTON},
  {registration: CHECKBOX_DEMO, name: 'Checkbox', path: Views.CHECKBOX},
  {registration: NUMBER_INPUT_DEMO, name: 'Number input', path: Views.NUMBER_INPUT},
  {registration: RADIO_INPUT_DEMO, name: 'Radio input', path: Views.RADIO_INPUT},
  {registration: SELECT_INPUT_DEMO, name: 'Select input', path: Views.SELECT_INPUT},
  {registration: TEXT_INPUT_DEMO, name: 'Text input', path: Views.TEXT_INPUT},
];

export const DISPLAY_SPECS: readonly PageSpec[] = [
  {registration: ANNOTATED_TEXT_DEMO, name: 'Annotated Text', path: Views.ANNOTATED_TEXT},
  {registration: CODE_BLOCK_DEMO, name: 'Code Block', path: Views.CODE_BLOCK},
  {registration: ICON_DEMO, name: 'Icon', path: Views.ICON},
  {registration: KEYBOARD_DEMO, name: 'Keyboard', path: Views.KEYBOARD},
];

export const GENERAL_SPECS: readonly PageSpec[] = [
  {registration: COLORS_DEMO, name: 'Colors', path: Views.COLORS},
  {registration: TEXTS_DEMO, name: 'Texts', path: Views.TEXT},
];

export const LAYOUT_SPECS: readonly PageSpec[] = [
  {registration: DRAWER_LAYOUT_DEMO, name: 'Drawer Layout', path: Views.DRAWER_LAYOUT},
  {registration: OVERLAY_LAYOUT_DEMO, name: 'Overlay Layout', path: Views.OVERLAY_LAYOUT},
];

export const ALL_SPECS = [
  ...ACTION_SPECS,
  ...DISPLAY_SPECS,
  ...GENERAL_SPECS,
  ...LAYOUT_SPECS,
];

export function getPageSpec(searchedPath: Views): PageSpec|null {
  return ALL_SPECS.find(({path}) => path === searchedPath) || null;
}
