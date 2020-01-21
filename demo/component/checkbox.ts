import { $checkbox, $textIconButton, _p, Checkbox as MaskCheckbox, TextIconButton, ThemedCustomElementCtrl } from 'export';

import { elementWithTagType } from '@gs-types';
import { api, element, InitFn } from '@persona';
import { Observable } from '@rxjs';
import { mapTo } from '@rxjs/operators';

import { DemoLayout } from '../base/demo-layout';

import template from './checkbox.html';


export const TAG = 'mkd-checkbox';

const $ = {
  resetButton: element('resetButton', elementWithTagType('mk-text-icon-button'), {
    ...api($textIconButton),
  }),
  unknownCheckbox: element('unknownCheckbox', elementWithTagType('mk-checkbox'), {
    ...api($checkbox),
  }),
};

@_p.customElement({
  dependencies: [
    DemoLayout,
    MaskCheckbox,
    TextIconButton,
  ],
  tag: TAG,
  template,
})
export class Checkbox extends ThemedCustomElementCtrl {
  private readonly onResetButtonAction$ = this.declareInput($.resetButton._.actionEvent);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.renderStream($.unknownCheckbox._.clearFn, this.renderClearUnknownCheckbox),
    ];
  }

  private renderClearUnknownCheckbox(): Observable<[]> {
    return this.onResetButtonAction$.pipe(mapTo([]));
  }
}
