import {customElementType} from 'persona';
import {CustomElementHarness, getHarness, InputHarness} from 'persona/export/testing';

import {RADIO_INPUT} from '../radio-input';


export class RadioInputHarness extends CustomElementHarness<typeof RADIO_INPUT> {
  static readonly validType = customElementType(RADIO_INPUT);

  private readonly harness = getHarness(this.target, '#input', InputHarness);

  simulateCheck(): void {
    this.harness.simulateChange(el => {
      el.checked = true;
    });
  }

  simulateUncheck(): void {
    this.harness.simulateChange(el => {
      el.checked = false;
    });
  }
}