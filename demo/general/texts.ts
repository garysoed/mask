import { PersonaContext } from 'persona';

import { _p } from '../../src/app/app';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';
import { DemoLayout } from '../base/demo-layout';

import template from './texts.html';


export const $texts = {
  tag: 'mkd-text',
  api: {},
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

