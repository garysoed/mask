import {cache} from 'gs-tools/export/data';
import {mapUndefinedTo} from 'gs-tools/export/rxjs';
import {Context, Ctrl, otext, query, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {BUTTON} from '../../src/action/button';
import {CHECKBOX, CheckedValue} from '../../src/input/checkbox';
import {LINE_LAYOUT} from '../../src/layout/line-layout';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';
import {bindInputToState} from '../util/bind-input-to-state';

import template from './checkbox.html';


const $checkboxDemo = {
  shadow: {
    disabledCheckbox: query('#disabledCheckbox', CHECKBOX),
    labelCheckbox: query('#labelCheckbox', CHECKBOX),
    labelCheckboxContent: query('#labelCheckboxContent', LINE_LAYOUT, {
      text: otext(),
    }),
    resetButton: query('#resetButton', BUTTON),
    unknownCheckbox: query('#unknownCheckbox', CHECKBOX),
    unknownCheckboxContent: query('#unknownCheckboxContent', LINE_LAYOUT, {
      text: otext(),
    }),
  },
};

export class CheckboxDemo implements Ctrl {
  private readonly $demoState = $demoState.get(this.$.vine)._('checkboxDemo');

  constructor(private readonly $: Context<typeof $checkboxDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      bindInputToState(
          this.$demoState.$('disabledCheckboxState'),
          this.$.shadow.disabledCheckbox,
      ),
      bindInputToState(
          this.$demoState.$('labelCheckboxState'),
          this.$.shadow.labelCheckbox,
      ),
      this.labelCheckboxLabel$.pipe(this.$.shadow.labelCheckboxContent.text()),
      bindInputToState(
          this.$demoState.$('unknownCheckboxState'),
          this.$.shadow.unknownCheckbox,
      ),
      this.unknownCheckboxLabel$.pipe(this.$.shadow.unknownCheckboxContent.text()),
      this.$.shadow.resetButton.actionEvent.pipe(
          map(() => [null] as const),
          this.$.shadow.unknownCheckbox.setValue(),
      ),
    ];
  }

  @cache()
  private get unknownCheckboxLabel$(): Observable<string> {
    return this.$demoState.$('unknownCheckboxState').pipe(
        mapUndefinedTo<CheckedValue>(null),
        map(value => {
          switch (value) {
            case true:
              return 'Checked';
            case false:
              return 'Unchecked';
            case null:
              return 'Initially unknown';
          }
        }),
    );
  }

  @cache()
  private get labelCheckboxLabel$(): Observable<string> {
    return this.$demoState.$('labelCheckboxState').pipe(
        mapUndefinedTo<CheckedValue>(null),
        map(value => {
          switch (value) {
            case true:
              return 'Checked';
            case false:
              return 'Unchecked';
            case null:
              return 'Initially unknown';
          }
        }),
    );
  }
}

export const CHECKBOX_DEMO = registerCustomElement({
  ctrl: CheckboxDemo,
  deps: [
    CHECKBOX,
    DEMO_LAYOUT,
  ],
  spec: $checkboxDemo,
  tag: 'mkd-checkbox',
  template,
});
