import {cache} from 'gs-tools/export/data';
import {attributeOut, BaseCtrl, hasAttribute, host, InputsOf, PersonaContext, setAttribute, stringParser, ValuesOf} from 'persona';
import {Output} from 'persona/export/internal';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';


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

export abstract class BaseAction<S extends typeof $> extends BaseCtrl<S> {
  protected readonly disabled$ = this.inputs.host.disabled;

  constructor(
      private readonly disabledDomOutput: Output<boolean>,
      context: PersonaContext,
      spec: S,
  ) {
    super(context, spec);
    this.render(this.disabledDomOutput, this.disabled$);
  }

  @cache()
  protected get baseValues(): ValuesOf<typeof $> {
    return {
      host: {
        ariaDisabled: this.ariaDisabled$,
        action1: this.baseInputs.host.isSecondary.pipe(map(isSecondary => !isSecondary)),
        action2: this.baseInputs.host.isSecondary,
      },
    };
  }

  @cache()
  private get baseInputs(): InputsOf<typeof $> {
    return this.inputs;
  }

  @cache()
  private get ariaDisabled$(): Observable<string> {
    return this.disabled$
        .pipe(
            map(v => v ? 'true' : 'false'),
        );
  }
}
