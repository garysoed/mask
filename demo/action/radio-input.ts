import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of, OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {BUTTON} from '../../src/action/button';
import {RADIO_INPUT} from '../../src/input/radio-input';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './radio-input.html';


const $radioInputDemo = {
  shadow: {
    optionA: query('#optionA', RADIO_INPUT),
    optionB: query('#optionB', RADIO_INPUT),
    optionC: query('#optionC', RADIO_INPUT),
    optionD: query('#optionD', RADIO_INPUT),
    resetButton: query('#resetButton', BUTTON),
  },
};


export class RadioInputDemo implements Ctrl {
  private readonly $state = $demoState.get(this.$.vine).radioInputDemo;

  constructor(private readonly $: Context<typeof $radioInputDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.$state.selectedKey).pipe(this.$.shadow.optionA.value()),
      of(this.$state.selectedKey).pipe(this.$.shadow.optionB.value()),
      of(this.$state.selectedKey).pipe(this.$.shadow.optionC.value()),
      of(this.$state.selectedKey).pipe(this.$.shadow.optionD.value()),
      this.$.shadow.resetButton.actionEvent.pipe(this.resetStates()),
    ];
  }

  private resetStates(): OperatorFunction<unknown, unknown> {
    return pipe(
        tap(() => {
          this.$state.selectedKey.next(null);
        }),
    );
  }
}

export const RADIO_INPUT_DEMO = registerCustomElement({
  ctrl: RadioInputDemo,
  deps: [
    BUTTON,
    DEMO_LAYOUT,
    RADIO_INPUT,
  ],
  spec: $radioInputDemo,
  tag: 'mkd-radio-input',
  template,
});
