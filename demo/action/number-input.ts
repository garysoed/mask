import {mutablePathSource} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$numberInput, NumberInput} from '../../src/action/input/number-input';
import {_p} from '../../src/app/app';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoStateId} from '../core/demo-state';

import template from './number-input.html';


export const $numberInputDemo = {
  tag: 'mkd-number-input',
  api: {},
};

const $ = {
  disabledInput: element('disabledInput', $numberInput, {}),
  enabledInput: element('enabledInput', $numberInput, {}),
  rangedInput: element('rangedInput', $numberInput, {}),
  steppedInput: element('steppedInput', $numberInput, {}),
};

const disabledNumberInputStatePath = mutablePathSource(
    'disabledNumberInputState',
    $demoStateId,
    demo => demo._('numberInputDemo')._('disabledNumberInputState'),
);
const enabledNumberInputStatePath = mutablePathSource(
    'enabledNumberInputState',
    $demoStateId,
    demo => demo._('numberInputDemo')._('enabledNumberInputState'),
);
const rangedNumberInputStatePath = mutablePathSource(
    'rangedNumberInputState',
    $demoStateId,
    demo => demo._('numberInputDemo')._('rangedNumberInputState'),
);
const steppedNumberInputStatePath = mutablePathSource(
    'steppedNumberInputState',
    $demoStateId,
    demo => demo._('numberInputDemo')._('steppedNumberInputState'),
);

@_p.customElement({
  ...$numberInputDemo,
  dependencies: [
    DemoLayout,
    NumberInput,
  ],
  template,
})
export class NumberInputDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.disabledInput.stateId(of(disabledNumberInputStatePath.get(this.vine))),
      this.renderers.enabledInput.stateId(of(enabledNumberInputStatePath.get(this.vine))),
      this.renderers.rangedInput.stateId(of(rangedNumberInputStatePath.get(this.vine))),
      this.renderers.steppedInput.stateId(of(steppedNumberInputStatePath.get(this.vine))),
    ];
  }
}
