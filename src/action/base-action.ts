import { cache } from 'gs-tools/export/data';
import { attributeOut, hasAttribute, host, PersonaContext, setAttribute, stringParser } from 'persona';
import { Output } from 'persona/export/internal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';


export const $$ = {
  api: {
    disabled: hasAttribute('mk-disabled'),
    isSecondary: hasAttribute('is-secondary'),
  },
};

export const $ = {
  host: host({
    ...$$.api,
    ariaDisabled: attributeOut('aria-disabled', stringParser(), 'false'),
    action1: setAttribute('mk-action-1'),
    action2: setAttribute('mk-action-2'),
  }),
};

export class BaseAction extends ThemedCustomElementCtrl {
  protected readonly disabled$ = this.declareInput($.host._.disabled);

  constructor(
      private readonly disabledDomOutput: Output<boolean>,
      context: PersonaContext,
  ) {
    super(context);
    this.render(this.disabledDomOutput, this.disabled$);
    this.render($.host._.ariaDisabled, this.ariaDisabled$);
    this.render($.host._.action1, this.isSecondaryAction$.pipe(map(isSecondary => !isSecondary)));
    this.render($.host._.action2, this.isSecondaryAction$);
  }

  @cache()
  private get ariaDisabled$(): Observable<string> {
    return this.disabled$
        .pipe(
            map(v => v ? 'true' : 'false'),
        );
  }

  @cache()
  private get isSecondaryAction$(): Observable<boolean> {
    return this.declareInput($.host._.isSecondary);
  }
}
