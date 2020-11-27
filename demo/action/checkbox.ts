import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {element, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map, mapTo} from 'rxjs/operators';

import {$button} from '../../src/action/button';
import {$checkbox, Checkbox, CheckedValue} from '../../src/action/input/checkbox';
import {SimpleCheckbox} from '../../src/action/simple/simple-checkbox';
import {_p} from '../../src/app/app';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoState} from '../core/demo-state';

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
export class CheckboxDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.disabledCheckbox.stateId(this.disabledCheckboxStateId$),
      this.renderers.labelCheckbox.stateId(this.labelCheckboxStateId$),
      this.renderers.unknownCheckbox.clearFn(this.onClearUnknownCheckbox$),
      this.renderers.unknownCheckbox.stateId(this.unknownCheckboxStateId$),
    ];
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
    return this.inputs.resetButton.actionEvent.pipe(mapTo([]));
  }

  @cache()
  private get unknownCheckboxStateId$(): Observable<StateId<CheckedValue>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.checkboxDemo.$unknownCheckboxState),
    );
  }
}
