import {customElementType} from 'persona';
import {CustomElementHarness, ElementHarness, getHarness} from 'persona/export/testing';

import {BUTTON} from '../button';

export class ButtonHarness extends CustomElementHarness<typeof BUTTON> {
  static readonly validType = customElementType(BUTTON);

  private readonly harness = getHarness(this.target, '#root', ElementHarness);

  simulateClick(options?: MouseEventInit): void {
    this.harness.simulateClick(options);
  }

  simulateEnter(): void {
    this.harness.simulateKeydown('Enter');
  }

  simulateSpace(): void {
    this.harness.simulateKeydown(' ');
  }
}