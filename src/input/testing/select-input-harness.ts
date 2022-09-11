import {customElementType} from 'persona';
import {CustomElementHarness, ElementHarness, getHarness} from 'persona/export/testing';

import {SELECT_INPUT} from '../select-input';

import {OverlayHarness} from './overlay-harness';
import {SelectOptionHarness} from './select-option-harness';


export class SelectInputHarness extends CustomElementHarness<typeof SELECT_INPUT> {
  static readonly validType = customElementType(SELECT_INPUT);

  simulateOpenOptions(options?: MouseEventInit): void {
    getHarness(this.target, '#root', ElementHarness).simulateClick(options);
  }

  simulateSelectOption(
      optionLabel: string,
      overlayEl: HTMLElement,
      openOptions?: MouseEventInit,
  ): void {
    this.simulateOpenOptions(openOptions);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getHarness(overlayEl, OverlayHarness).getContent(SelectOptionHarness)!
        .simulateClickOption(optionLabel);
  }
}