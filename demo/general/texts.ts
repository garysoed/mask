import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { classToggle, element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';

import { _p } from '../../src/app/app';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';
import { DemoLayout } from '../base/demo-layout';
import { $isDark } from '../core/is-dark';

import template from './texts.html';


export const $texts = {
  tag: 'mkd-text',
  api: {},
};

const $ = {
};

@_p.customElement({
  ...$texts,
  dependencies: [
    DemoLayout,
  ],
  template,
})
export class Texts extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
  }
}

