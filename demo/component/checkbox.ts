import { $checkbox, $textIconButton, _p, Checkbox as MaskCheckbox, TextIconButton, ThemedCustomElementCtrl } from 'export';
import { element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import { DemoLayout } from '../base/demo-layout';

import template from './checkbox.html';


export const TAG = 'mkd-checkbox';

const $ = {
  resetButton: element('resetButton', $textIconButton, {}),
  unknownCheckbox: element('unknownCheckbox', $checkbox, {}),
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

  constructor(context: PersonaContext) {
    super(context);

    this.render($.unknownCheckbox._.clearFn).withFunction(this.renderClearUnknownCheckbox);
  }

  private renderClearUnknownCheckbox(): Observable<[]> {
    return this.onResetButtonAction$.pipe(mapTo([]));
  }
}
