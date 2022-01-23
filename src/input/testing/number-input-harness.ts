import {customElementType} from 'persona';
import {CustomElementHarness, getHarness, InputHarness} from 'persona/export/testing';

import {NUMBER_INPUT} from '../number-input';


export class NumberInputHarness extends CustomElementHarness<typeof NUMBER_INPUT> {
  static readonly validType = customElementType(NUMBER_INPUT);

  private readonly harness = getHarness(this.target, '#input', InputHarness);

  simulateMouseOut(): void {
    this.harness.simulateMouseOut();
  }

  simulateMouseOver(): void {
    this.harness.simulateMouseOver();
  }

  simulateNumberInput(value: number): void {
    this.harness.simulateChange(el => {
      el.value = `${value}`;
    });
  }
}