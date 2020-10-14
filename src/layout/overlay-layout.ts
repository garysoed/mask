import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import template from './overlay-layout.html';

const $overlayLayout = {
  tag: 'mk-overlay-layout',
  api: {},
};

@_p.customElement({
  ...$overlayLayout,
  template,
})
export class OverlayLayout extends ThemedCustomElementCtrl {

}
