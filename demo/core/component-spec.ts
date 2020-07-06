import { CustomElementCtrlCtor } from 'persona/export/internal';

import { $$ as $breadcrumb, Breadcrumb } from '../component/breadcrumb';
import { $$ as $checkbox, Checkbox } from '../component/checkbox';
import { $$ as $codeBlock, CodeBlock } from '../component/code-block';
import { $$ as $colors, Colors } from '../component/colors';
import { $$ as $croppedLine, CroppedLine } from '../component/cropped-line';
import { $$ as $dialog, Dialog } from '../component/dialog';
import { $$ as $drawer, Drawer } from '../component/drawer';
import { $$ as $icon, Icon } from '../component/icon';
import { $$ as $iconWithText, IconWithText } from '../component/icon-with-text';
import { $$ as $textInput, TextInput } from '../component/text-input';
import { $$ as $uploadButton, UploadButton } from '../component/upload-button';

import { Views } from './location-service';


export interface ComponentSpec {
  readonly ctor: CustomElementCtrlCtor;
  readonly name: string;
  readonly path: Views;
  readonly tag: string;
}

export const COMPONENT_SPECS: readonly ComponentSpec[] = [
  {ctor: Breadcrumb, name: 'Breadcrumb', path: Views.BREADCRUMB, tag: $breadcrumb.tag},
  {ctor: Checkbox, name: 'Checkbox', path: Views.CHECKBOX, tag: $checkbox.tag},
  {ctor: CodeBlock, name: 'Code Block', path: Views.CODE_BLOCK, tag: $codeBlock.tag},
  {ctor: Colors, name: 'Colors', path: Views.COLORS, tag: $colors.tag},
  {ctor: CroppedLine, name: 'Cropped Line', path: Views.CROPPED_LINE, tag: $croppedLine.tag},
  {ctor: Dialog, name: 'Dialog', path: Views.DIALOG, tag: $dialog.tag},
  {ctor: Drawer, name: 'Drawer', path: Views.DRAWER, tag: $drawer.tag},
  {ctor: Icon, name: 'Icon', path: Views.ICON, tag: $icon.tag},
  {ctor: IconWithText, name: 'Icon with Text', path: Views.ICON_WITH_TEXT, tag: $iconWithText.tag},
  {ctor: TextInput, name: 'Text Input', path: Views.TEXT_INPUT, tag: $textInput.tag},
  {ctor: UploadButton, name: 'Upload Button', path: Views.UPLOAD_BUTTON, tag: $uploadButton.tag},
];
