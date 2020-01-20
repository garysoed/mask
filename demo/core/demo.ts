import { _p, _v, RootLayout, ThemedCustomElementCtrl } from 'export';

import { repeated } from '@persona';

import template from './demo.html';

const $ = {
  componentButtons: repeated('componentButtons'),
};

@_p.customElement({
  dependencies: [
    RootLayout,
  ],
  tag: 'mkd-demo',
  template,
})
export class Demo extends ThemedCustomElementCtrl {

}

