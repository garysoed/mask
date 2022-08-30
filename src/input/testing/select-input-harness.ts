import {customElementType} from 'persona';
import {CustomElementHarness, ElementHarness, getHarness} from 'persona/export/testing';

import {SELECT_INPUT} from '../select-input';


export class SelectInputHarness extends CustomElementHarness<typeof SELECT_INPUT> {
  static readonly validType = customElementType(SELECT_INPUT);

  simulateOpenOptions(options?: MouseEventInit): void {
    getHarness(this.target, '#root', ElementHarness).simulateClick(options);
  }
}