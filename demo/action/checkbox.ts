import { cache } from 'gs-tools/export/data';
import { StateId } from 'gs-tools/export/state';
import { element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';

import { $button } from '../../src/action/button';
import { $checkbox, Checkbox, CheckedValue } from '../../src/action/input/checkbox';
import { SimpleCheckbox } from '../../src/action/simple/simple-checkbox';
import { _p } from '../../src/app/app';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';
import { DemoLayout } from '../base/demo-layout';
import { $demoState } from '../core/demo-state';

import template from './checkbox.html';


export const $checkboxDemo = {
  tag: 'mkd-checkbox',
  api: {},
};

const $ = {
  disabledCheckbox: element('disabledCheckbox', $checkbox, {}),
  labelCheckbox: element('labelCheckbox', $checkbox, {}),
  resetButton: element('resetButton', $button, {}),
  unknownCheckbox: element('unknownCheckbox', $checkbox, {}),
};

@_p.customElement({
  ...$checkboxDemo,
  dependencies: [
    Checkbox,
    DemoLayout,
    SimpleCheckbox,
  ],
  template,
})
export class CheckboxDemo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.unknownCheckbox._.clearFn, this.onClearUnknownCheckbox$);

    this.render($.disabledCheckbox._.stateId, this.disabledCheckboxStateId$);
    this.render($.labelCheckbox._.stateId, this.labelCheckboxStateId$);
    this.render($.unknownCheckbox._.stateId, this.unknownCheckboxStateId$);
  }

  @cache()
  private get disabledCheckboxStateId$(): Observable<StateId<CheckedValue>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.checkboxDemo.$disabledCheckboxState),
    );
  }

  @cache()
  private get labelCheckboxStateId$(): Observable<StateId<CheckedValue>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.checkboxDemo.$labelCheckboxState),
    );
  }

  @cache()
  private get onClearUnknownCheckbox$(): Observable<[]> {
    return this.declareInput($.resetButton._.actionEvent).pipe(mapTo([]));
  }

  @cache()
  private get unknownCheckboxStateId$(): Observable<StateId<CheckedValue>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.checkboxDemo.$unknownCheckboxState),
    );
  }
}
