import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import template from './line.html';

export const $line = {
  tag: 'mk-line',
  api: {},
};

@_p.customElement({
  ...$line,
  template,
})
export class Line extends ThemedCustomElementCtrl {

}
