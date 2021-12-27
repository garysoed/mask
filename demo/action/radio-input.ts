import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, id, registerCustomElement} from 'persona';
import {merge, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {BUTTON} from '../../src-next/action/button';
import {bindRadioInputToState, RADIO_INPUT} from '../../src-next/input/radio-input';
import {renderTheme} from '../../src-next/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './radio-input.html';


const $radioInputDemo = {
  shadow: {
    optionA: id('optionA', RADIO_INPUT),
    optionB: id('optionB', RADIO_INPUT),
    optionC: id('optionC', RADIO_INPUT),
    optionD: id('optionD', RADIO_INPUT),
    resetButton: id('resetButton', BUTTON),
  },
};


export class RadioInputDemo implements Ctrl {
  private readonly $state = $demoState.get(this.$.vine)._('radioInputDemo');

  constructor(private readonly $: Context<typeof $radioInputDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      bindRadioInputToState(
          this.$state.$('selectedKey'),
          [
            this.$.shadow.optionA,
            this.$.shadow.optionB,
            this.$.shadow.optionC,
            this.$.shadow.optionD,
          ],
      ),
      this.$.shadow.resetButton.actionEvent.pipe(this.resetStates()),
    ];
  }

  private resetStates(): OperatorFunction<unknown, unknown> {
    return pipe(
        switchMap(() => {
          const bindings = [
            this.$.shadow.optionA,
            this.$.shadow.optionB,
            this.$.shadow.optionC,
            this.$.shadow.optionD,
          ];

          const obs$List = bindings.map(binding => of(null).pipe(
              binding.initValue(),
              binding.clearFn(),
          ));
          return merge(...obs$List);
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
