import { attributeOut, element, hasAttribute, InitFn } from '@persona';
import { Output } from '@persona/internal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p, _v } from '../app/app';
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
  protected readonly disabledObs = _p.input($.host._.disabled, this);

  constructor(
      private readonly disabledOutput: Output<boolean>,
      shadowRoot: ShadowRoot,
  ) {
    super(shadowRoot);
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render(this.disabledOutput).withObservable(this.disabledObs),
      _p.render($.host._.ariaDisabled).withVine(_v.stream(this.renderAriaDisabled, this)),
    ];
  }

  private renderAriaDisabled(): Observable<string> {
    return this.disabledObs
        .pipe(
            map(v => v ? 'true' : 'false'),
        );
  }
}
