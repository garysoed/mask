import {Registration} from 'persona';

import {BUTTON_DEMO} from '../action/button';
import {CHECKBOX_DEMO} from '../action/checkbox';
import {ICON_DEMO} from '../display/icon';
import {COLORS_DEMO} from '../general/colors';
import {TEXTS_DEMO} from '../general/texts';

import {Views} from './location-service';


export interface PageSpec {
  readonly registration: Registration<HTMLElement, any>;
  readonly name: string;
  readonly path: Views;
}

export const ACTION_SPECS: readonly PageSpec[] = [
  {registration: BUTTON_DEMO, name: 'Button', path: Views.BUTTON},
  {registration: CHECKBOX_DEMO, name: 'Checkbox', path: Views.CHECKBOX},
  // {ctor: NumberInputDemo, componentSpec: $numberInputDemo, name: 'Number input', path: Views.NUMBER_INPUT},
  // {
  //   ctor: RadioInputDemo,
  //   componentSpec: $radioInputDemo,
  //   name: 'Radio input',
  //   path: Views.RADIO_INPUT,
  // },
  // {ctor: TextInputDemo, componentSpec: $textInputDemo, name: 'Text input', path: Views.TEXT_INPUT},
];

export const DISPLAY_SPECS: readonly PageSpec[] = [
  // {
  //   ctor: AnnotatedTextDemo,
  //   componentSpec: $annotatedTextDemo,
  //   name: 'Annotated Text',
  //   path: Views.ANNOTATED_TEXT,
  // },
  // {ctor: CodeBlockDemo, componentSpec: $codeBlockDemo, name: 'Code Block', path: Views.CODE_BLOCK},
  {registration: ICON_DEMO, name: 'Icon', path: Views.ICON},
  // {ctor: KeyboardDemo, componentSpec: $keyboardDemo, name: 'Keyboard', path: Views.KEYBOARD},
];

export const GENERAL_SPECS: readonly PageSpec[] = [
  {registration: COLORS_DEMO, name: 'Colors', path: Views.COLORS},
  {registration: TEXTS_DEMO, name: 'Texts', path: Views.TEXT},
];

export const LAYOUT_SPECS: readonly PageSpec[] = [
  // {
  //   ctor: DrawerLayoutDemo,
  //   componentSpec: $drawerLayoutDemo,
  //   name: 'Drawer Layout',
  //   path: Views.DRAWER_LAYOUT,
  // },
  // {
  //   ctor: OverlayLayoutDemo,
  //   componentSpec: $overlayLayoutDemo,
  //   name: 'Overlay Layout',
  //   path: Views.OVERLAY_LAYOUT,
  // },
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
