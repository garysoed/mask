import {cache} from 'gs-tools/export/data';
import {attributeOut, BaseCtrl, hasAttribute, host, InputsOf, PersonaContext, setAttribute, stringParser, ValuesOf} from 'persona';
import {Output} from 'persona/export/internal';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';


export const $baseAction = {
  api: {
    disabled: hasAttribute('mk-disabled'),
    isSecondary: hasAttribute('is-secondary'),
    ariaDisabled: attributeOut('aria-disabled', stringParser(), 'false'),
    action1: setAttribute('mk-action-1'),
    action2: setAttribute('mk-action-2'),
  },
};

export const $ = {
  host: host($baseAction.api),
};


export abstract class BaseAction<S extends typeof $> extends BaseCtrl<S> {
  constructor(
      private readonly disabledDomOutput: Output<boolean>,
      context: PersonaContext,
  ) {
    super(context);
    // TODO: Avoid addSetup
    this.addSetup(this.renderDisabledDomOutput$);
  }

  @cache()
  protected get baseActionValues(): ValuesOf<typeof $> {
    return {
      host: {
        ariaDisabled: this.ariaDisabled$,
        action1: this.baseActionInputs.host.isSecondary.pipe(map(isSecondary => !isSecondary)),
        action2: this.baseActionInputs.host.isSecondary,
      },
    };
  }

  @cache()
  private get baseActionInputs(): InputsOf<typeof $> {
    return this.inputs;
  }

  @cache()
  private get ariaDisabled$(): Observable<string> {
    return this.baseActionInputs.host.disabled
        .pipe(
            map(v => v ? 'true' : 'false'),
        );
  }

  @cache()
  protected get disabled$(): Observable<boolean> {
    return this.baseActionInputs.host.disabled;
  }

  @cache()
  private get renderDisabledDomOutput$(): Observable<unknown> {
    return this.baseActionInputs.host.disabled.pipe(this.disabledDomOutput.output(this.context));
  }
}
