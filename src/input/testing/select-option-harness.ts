import {arrayFrom} from 'gs-tools/export/collect';
import {customElementType} from 'persona';
import {CustomElementHarness, ElementHarness, getHarness} from 'persona/export/testing';

import {SELECT_OPTIONS} from '../select-options';


export class SelectOptionHarness extends CustomElementHarness<typeof SELECT_OPTIONS> {
  static readonly validType = customElementType(SELECT_OPTIONS);

  simulateClickOption(text: string, options?: MouseEventInit): void {
    const shadowRoot = this.target.shadowRoot;
    if (!shadowRoot) {
      throw new Error('No shadow roots found');
    }
    const target = arrayFrom(shadowRoot.querySelectorAll('mk-line-layout'))
        .find(div => div.textContent === text);
    if (!target) {
      throw new Error(`Element with text "${text}" not found`);
    }
    getHarness(target, ElementHarness).simulateClick(options);
  }
}