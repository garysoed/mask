import {customElementType} from 'persona';
import {CustomElementHarness, getHarness, InputHarness} from 'persona/export/testing';

import {CHECKBOX} from '../checkbox';


export class CheckboxHarness extends CustomElementHarness<typeof CHECKBOX> {
  static readonly validType = customElementType(CHECKBOX);

  private readonly harness = getHarness(this.target, '#input', InputHarness);

  simulateCheck(): void {
    this.harness.simulateChange(el => {
      el.indeterminate = false;
      el.checked = true;
    });
  }
}