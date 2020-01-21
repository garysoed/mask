import { CustomElementCtrlCtor } from '@persona/internal';

import { Breadcrumb, TAG as BREADCRUMB_TAG } from '../component/breadcrumb';
import { Checkbox, TAG as CHECKBOX_TAG } from '../component/checkbox';
import { Icon, TAG as ICON_TAG } from '../component/icon';

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
  {ctor: Icon, name: 'Icon', path: Views.ICON, tag: ICON_TAG},
];
