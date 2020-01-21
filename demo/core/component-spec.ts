import { CustomElementCtrlCtor } from '@persona/internal';

import { Icon, TAG as ICON_TAG } from '../component/icon';

import { Views } from './location-service';


export interface ComponentSpec {
  readonly ctor: CustomElementCtrlCtor;
  readonly name: string;
  readonly path: Views;
  readonly tag: string;
}

export const COMPONENT_SPECS: readonly ComponentSpec[] = [
  {ctor: Icon, name: 'Icon', path: Views.ICON, tag: ICON_TAG},
];
