import { _p, CroppedLine as MaskCroppedLine, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './cropped-line.html';


export const TAG = 'mkd-cropped-line';

@_p.customElement({
  dependencies: [
    DemoLayout,
    MaskCroppedLine,
  ],
  tag: TAG,
  template,
})
export class CroppedLine extends ThemedCustomElementCtrl {
}
