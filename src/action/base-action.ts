import { Vine } from 'grapevine';
import { attributeOut, element, hasAttribute } from 'persona';
import { Output } from 'persona/export/internal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';


export const $$ = {
  disabled: hasAttribute('disabled'),
};

export const $ = {
  host: element({
    ...$$,
    ariaDisabled: attributeOut('aria-disabled', stringParser(), 'false'),
  }),
};

export class BaseAction extends ThemedCustomElementCtrl {
  protected readonly disabled$ = this.declareInput($.host._.disabled);

  constructor(
      private readonly disabledOutput: Output<boolean>,
      shadowRoot: ShadowRoot,
      vine: Vine,
  ) {
    super(shadowRoot, vine);
    this.render(this.disabledOutput).withObservable(this.disabled$);
    this.render($.host._.ariaDisabled).withFunction(this.renderAriaDisabled);
  }

  private renderAriaDisabled(): Observable<string> {
    return this.disabled$
        .pipe(
            map(v => v ? 'true' : 'false'),
        );
  }
}
