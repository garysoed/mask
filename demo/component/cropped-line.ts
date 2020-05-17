import { _p, CroppedLine as MaskCroppedLine, ThemedCustomElementCtrl } from 'export';

import { DemoLayout } from '../base/demo-layout';

import template from './cropped-line.html';


export const $$ = {
  tag: 'mkd-cropped-line',
  api: {},
};

@_p.customElement({
  ...$$,
  dependencies: [
    DemoLayout,
    MaskCroppedLine,
  ],
  template,
})
export class CroppedLine extends ThemedCustomElementCtrl {
}
