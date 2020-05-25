import { attributeOut, hasAttribute, host, PersonaContext, stringParser } from 'persona';
import { Output } from 'persona/export/internal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';


export const $$ = {
  api: {
    disabled: hasAttribute('disabled'),
  },
};

export const $ = {
  host: host({
    ...$$.api,
    ariaDisabled: attributeOut('aria-disabled', stringParser(), 'false'),
  }),
};

export class BaseAction extends ThemedCustomElementCtrl {
  protected readonly disabled$ = this.declareInput($.host._.disabled);

  constructor(
      private readonly disabledOutput: Output<boolean>,
      context: PersonaContext,
  ) {
    super(context);
    this.render(this.disabledOutput, this.disabled$);
    this.render($.host._.ariaDisabled, this.renderAriaDisabled());
  }

  private renderAriaDisabled(): Observable<string> {
    return this.disabled$
        .pipe(
            map(v => v ? 'true' : 'false'),
        );
  }
}
