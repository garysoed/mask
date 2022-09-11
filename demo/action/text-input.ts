import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';

import {TEXT_INPUT} from '../../src/input/text-input';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';
import {bindInputToState} from '../util/bind-input-to-state';

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

export class TextInputDemo implements Ctrl {
  private readonly $state = $demoState.get(this.$.vine)._('textInputDemo');

  constructor(private readonly $: Context<typeof $textInputDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      bindInputToState(this.$state.$('disabledTextInputState'), this.$.shadow.disabledInput),
      bindInputToState(this.$state.$('emailTextInputState'), this.$.shadow.emailInput),
      bindInputToState(this.$state.$('enabledTextInputState'), this.$.shadow.enabledInput),
      bindInputToState(this.$state.$('telTextInputState'), this.$.shadow.telInput),
      bindInputToState(this.$state.$('urlTextInputState'), this.$.shadow.urlInput),
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