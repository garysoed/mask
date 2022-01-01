import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, id, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';

import {NUMBER_INPUT} from '../../src/input/number-input';
import {renderTheme} from '../../src/theme/render-theme';
import {bindInputToState} from '../../src/util/bind-input-to-state';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './number-input.html';


export const $numberInputDemo = {
  shadow: {
    disabledInput: id('disabledInput', NUMBER_INPUT),
    enabledInput: id('enabledInput', NUMBER_INPUT),
    rangedInput: id('rangedInput', NUMBER_INPUT),
    steppedInput: id('steppedInput', NUMBER_INPUT),
  },
};

export class NumberInputDemo implements Ctrl {
  private readonly $state = $demoState.get(this.$.vine)._('numberInputDemo');

  constructor(private readonly $: Context<typeof $numberInputDemo>) {
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      bindInputToState(this.$state.$('disabledNumberInputState'), this.$.shadow.disabledInput),
      bindInputToState(this.$state.$('enabledNumberInputState'), this.$.shadow.enabledInput),
      bindInputToState(this.$state.$('rangedNumberInputState'), this.$.shadow.rangedInput),
      bindInputToState(this.$state.$('steppedNumberInputState'), this.$.shadow.steppedInput),
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