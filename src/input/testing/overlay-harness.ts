import {customElementType} from 'persona';
import {CustomElementHarness, getHarness, Harness, HarnessCtor} from 'persona/export/testing';

import {OVERLAY} from '../../core/overlay';


export class OverlayHarness extends CustomElementHarness<typeof OVERLAY> {
  static readonly validType = customElementType(OVERLAY);

  getContent<E extends Element, H extends Harness<E>>(harness: HarnessCtor<E, H>): H|null {
    const contentEl = this.target.shadowRoot?.querySelector('#content');
    if (!contentEl) {
      return null;
    }

    return getHarness(contentEl.children[0] as E, harness);
  }
}