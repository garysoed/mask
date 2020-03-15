import { CustomElementCtrlCtor } from 'persona/export/internal';

import { Breadcrumb, TAG as BREADCRUMB_TAG } from '../component/breadcrumb';
import { Checkbox, TAG as CHECKBOX_TAG } from '../component/checkbox';
import { Colors, TAG as COLORS_TAG } from '../component/colors';
import { CroppedLine, TAG as CROPPED_LINE_TAG } from '../component/cropped-line';
import { Dialog, TAG as DIALOG_TAG } from '../component/dialog';
import { Drawer, TAG as DRAWER_TAG } from '../component/drawer';
import { Icon, TAG as ICON_TAG } from '../component/icon';
import { IconWithText, TAG as ICON_WITH_TEXT_TAG } from '../component/icon-with-text';
import { TAG as TEXT_INPUT_TAG, TextInput } from '../component/text-input';

import { Views } from './location-service';

export interface ComponentSpec {
  readonly ctor: CustomElementCtrlCtor;
  readonly name: string;
  readonly path: Views;
  readonly tag: string;
}

export const COMPONENT_SPECS: readonly ComponentSpec[] = [
  {ctor: Breadcrumb, name: 'Breadcrumb', path: Views.BREADCRUMB, tag: BREADCRUMB_TAG},
  {ctor: Checkbox, name: 'Checkbox', path: Views.CHECKBOX, tag: CHECKBOX_TAG},
  {ctor: Colors, name: 'Colors', path: Views.COLORS, tag: COLORS_TAG},
  {ctor: CroppedLine, name: 'Cropped Line', path: Views.CROPPED_LINE, tag: CROPPED_LINE_TAG},
  {ctor: Dialog, name: 'Dialog', path: Views.DIALOG, tag: DIALOG_TAG},
  {ctor: Drawer, name: 'Drawer', path: Views.DRAWER, tag: DRAWER_TAG},
  {ctor: Icon, name: 'Icon', path: Views.ICON, tag: ICON_TAG},
  {ctor: IconWithText, name: 'Icon with Text', path: Views.ICON_WITH_TEXT, tag: ICON_WITH_TEXT_TAG},
  {ctor: TextInput, name: 'Text Input', path: Views.TEXT_INPUT, tag: TEXT_INPUT_TAG},
];
