import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {NUMBER_INPUT} from '../../src/input/number-input';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './number-input.html';


export const $numberInputDemo = {
  shadow: {
    disabledInput: query('#disabledInput', NUMBER_INPUT),
    enabledInput: query('#enabledInput', NUMBER_INPUT),
    rangedInput: query('#rangedInput', NUMBER_INPUT),
    steppedInput: query('#steppedInput', NUMBER_INPUT),
  },
};

class NumberInputDemo implements Ctrl {
  private readonly $state = $demoState.get(this.$.vine).numberInputDemo;

  constructor(private readonly $: Context<typeof $numberInputDemo>) {
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.$state.disabledNumberInputState).pipe(this.$.shadow.disabledInput.value()),
      of(this.$state.enabledNumberInputState).pipe(this.$.shadow.enabledInput.value()),
      of(this.$state.rangedNumberInputState).pipe(this.$.shadow.rangedInput.value()),
      of(this.$state.steppedNumberInputState).pipe(this.$.shadow.steppedInput.value()),
    ];
  }
}

export const NUMBER_INPUT_DEMO = registerCustomElement({
  ctrl: NumberInputDemo,
  deps: [
    DEMO_LAYOUT,
    NUMBER_INPUT,
  ],
  spec: $numberInputDemo,
  tag: 'mkd-number-input',
  template,
});