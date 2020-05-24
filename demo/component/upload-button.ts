import { DemoLayout } from 'demo/base/demo-layout';
import { $uploadButton, _p, ThemedCustomElementCtrl, UploadButton as MaskUploadButton } from 'export';
import { element } from 'persona';

import template from './upload-button.html';


export const $$ = {
  tag: 'mkd-upload-button',
  api: {},
};

const $ = {
  button: element('button', $uploadButton, {}),
};

@_p.customElement({
  ...$$,
  dependencies: [
    DemoLayout,
    MaskUploadButton,
  ],
  template,
})
export class UploadButton extends ThemedCustomElementCtrl { }
