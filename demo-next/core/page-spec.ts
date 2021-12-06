import {Registration} from 'persona';
import {Spec} from 'persona/src-next/types/ctrl';

import {BUTTON_DEMO} from '../action/button';

// import {$buttonDemo, ButtonDemo} from '../action/button';
// import {$checkboxDemo, CheckboxDemo} from '../action/checkbox';
// import {$numberInputDemo, NumberInputDemo} from '../action/number-input';
// import {$radioInputDemo, RadioInputDemo} from '../action/radio-input';
// import {$textInputDemo, TextInputDemo} from '../action/text-input';
// import {$annotatedTextDemo, AnnotatedTextDemo} from '../display/annotated-text';
// import {$codeBlockDemo, CodeBlockDemo} from '../display/code-block';
// import {$iconDemo, IconDemo} from '../display/icon';
// import {$keyboardDemo, KeyboardDemo} from '../display/keyboard';
// import {$colorsDemo, ColorsDemo} from '../general/colors';
// import {$textsDemo, TextsDemo} from '../general/texts';
// import {$drawerLayoutDemo, DrawerLayoutDemo} from '../layout/drawer-layout';
// import {$overlayLayoutDemo, OverlayLayoutDemo} from '../layout/overlay-layout';
import {Views} from './location-service';


export interface PageSpec {
  readonly registration: Registration<HTMLElement, Spec>;
  readonly name: string;
  readonly path: Views;
}

export const ACTION_SPECS: readonly PageSpec[] = [
  {registration: BUTTON_DEMO, name: 'Button', path: Views.BUTTON},
  // {ctor: CheckboxDemo, componentSpec: $checkboxDemo, name: 'Checkbox', path: Views.CHECKBOX},
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
  // {ctor: IconDemo, componentSpec: $iconDemo, name: 'Icon', path: Views.ICON},
  // {ctor: KeyboardDemo, componentSpec: $keyboardDemo, name: 'Keyboard', path: Views.KEYBOARD},
];

export const GENERAL_SPECS: readonly PageSpec[] = [
  // {ctor: ColorsDemo, componentSpec: $colorsDemo, name: 'Colors', path: Views.COLORS},
  // {ctor: TextsDemo, componentSpec: $textsDemo, name: 'Texts', path: Views.TEXT},
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
