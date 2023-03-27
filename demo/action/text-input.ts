import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {TEXT_INPUT} from '../../src/input/text-input';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';

import template from './text-input.html';


const $textInputDemo = {
  shadow: {
    disabledInput: query('#disabledInput', TEXT_INPUT),
    emailInput: query('#emailInput', TEXT_INPUT),
    enabledInput: query('#enabledInput', TEXT_INPUT),
    telInput: query('#telInput', TEXT_INPUT),
    urlInput: query('#urlInput', TEXT_INPUT),
  },
};

class TextInputDemo implements Ctrl {
  private readonly $state = $demoState.get(this.$.vine).textInputDemo;

  constructor(private readonly $: Context<typeof $textInputDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.$state.disabledTextInputState).pipe(this.$.shadow.disabledInput.value()),
      of(this.$state.emailTextInputState).pipe(this.$.shadow.emailInput.value()),
      of(this.$state.enabledTextInputState).pipe(this.$.shadow.enabledInput.value()),
      of(this.$state.telTextInputState).pipe(this.$.shadow.telInput.value()),
      of(this.$state.urlTextInputState).pipe(this.$.shadow.urlInput.value()),
    ];
  }
}

export const TEXT_INPUT_DEMO = registerCustomElement({
  ctrl: TextInputDemo,
  deps: [
    DEMO_LAYOUT,
    TEXT_INPUT,
  ],
  spec: $textInputDemo,
  tag: 'mkd-text-input',
  template,
});