import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {SELECT_INPUT} from '../../src/input/select-input';
import {Option} from '../../src/input/select-options';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';
import {bindInputToState} from '../util/bind-input-to-state';

import template from './select-input.html';


const $selectInputDemo = {
  shadow: {
    disabledInput: query('#disabledInput', SELECT_INPUT),
    enabledInput: query('#enabledInput', SELECT_INPUT),
  },
};

class SelectInputDemo implements Ctrl {
  private readonly $state = $demoState.get(this.$.vine).selectInputDemo;

  constructor(private readonly $: Context<typeof $selectInputDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      bindInputToState(this.$state.disabledSelectInputState, this.$.shadow.disabledInput),
      bindInputToState(this.$state.enabledSelectInputState, this.$.shadow.enabledInput),
      this.options$.pipe(this.$.shadow.disabledInput.options()),
      this.options$.pipe(this.$.shadow.enabledInput.options()),
    ];
  }

  @cache()
  private get options$(): Observable<readonly Option[]> {
    return of([
      {key: '1', text: 'Apple'},
      {key: '2', text: 'Banana'},
      {key: '3', text: 'Coconut'},
      {key: '4', text: 'Durian'},
      {key: '5', text: 'Eggplant'},
    ]);
  }
}

export const SELECT_INPUT_DEMO = registerCustomElement({
  ctrl: SelectInputDemo,
  deps: [
    DEMO_LAYOUT,
    SELECT_INPUT,
  ],
  spec: $selectInputDemo,
  tag: 'mkd-select-input',
  template,
});