import {customElementType} from 'persona';
import {CustomElementHarness, getHarness, InputHarness} from 'persona/export/testing';

import {TEXT_INPUT} from '../text-input';


export class TextInputHarness extends CustomElementHarness<typeof TEXT_INPUT> {
  static readonly validType = customElementType(TEXT_INPUT);

  private readonly harness = getHarness(this.target, '#input', InputHarness);

  simulateMouseOut(): void {
    this.harness.simulateMouseOut();
  }

  simulateMouseOver(): void {
    this.harness.simulateMouseOver();
  }

  simulateTextInput(value: string): void {
    this.harness.simulateChange(el => {
      el.value = value;
    });
  }
}