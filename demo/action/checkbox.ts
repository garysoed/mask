import {mutablePathSource} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';
import {mapTo} from 'rxjs/operators';

import {$button} from '../../src/action/button';
import {$checkbox, Checkbox} from '../../src/action/input/checkbox';
import {_p} from '../../src/app/app';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoStateId} from '../core/demo-state';

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

const disabledCheckboxStatePath = mutablePathSource(
    'disabledCheckboxState',
    $demoStateId,
    demo => demo._('checkboxDemo')._('disabledCheckboxState'),
);

const unknownCheckboxStatePath = mutablePathSource(
    'unknownCheckboxState',
    $demoStateId,
    demo => demo._('checkboxDemo')._('unknownCheckboxState'),
);

const labelCheckboxStatePath = mutablePathSource(
    'labelCheckboxState',
    $demoStateId,
    demo => demo._('checkboxDemo')._('labelCheckboxState'),
);

@_p.customElement({
  ...$checkboxDemo,
  dependencies: [
    Checkbox,
    DemoLayout,
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
      this.renderers.disabledCheckbox.stateId(of(disabledCheckboxStatePath.get(this.vine))),
      this.renderers.labelCheckbox.stateId(of(labelCheckboxStatePath.get(this.vine))),
      this.renderers.unknownCheckbox.clearFn(this.onClearUnknownCheckbox$),
      this.renderers.unknownCheckbox.stateId(of(unknownCheckboxStatePath.get(this.vine))),
    ];
  }

  @cache()
  private get onClearUnknownCheckbox$(): Observable<[]> {
    return this.inputs.resetButton.actionEvent.pipe(mapTo([]));
  }
}
