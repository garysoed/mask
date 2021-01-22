import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {element, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {$numberInput, NumberInput} from '../../src/action/input/number-input';
import {_p} from '../../src/app/app';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoState} from '../core/demo-state';

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
      this.renderers.disabledInput.stateId(this.disabledInputStateId$),
      this.renderers.enabledInput.stateId(this.enabledInputStateId$),
      this.renderers.rangedInput.stateId(this.rangedInputStateId$),
      this.renderers.steppedInput.stateId(this.steppedInputStateId$),
    ];
  }

  @cache()
  private get disabledInputStateId$(): Observable<StateId<number>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.numberInputDemo.$disabledNumberInputState),
    );
  }

  @cache()
  private get enabledInputStateId$(): Observable<StateId<number>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.numberInputDemo.$enabledNumberInputState),
    );
  }

  @cache()
  private get rangedInputStateId$(): Observable<StateId<number>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.numberInputDemo.$rangedNumberInputState),
    );
  }

  @cache()
  private get steppedInputStateId$(): Observable<StateId<number>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.numberInputDemo.$steppedNumberInputState),
    );
  }
}
