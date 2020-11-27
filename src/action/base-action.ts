import {cache} from 'gs-tools/export/data';
import {attributeOut, hasAttribute, host, InputsOf, PersonaContext, setAttribute, stringParser} from 'persona';
import {Output} from 'persona/export/internal';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {BaseThemedCtrl} from '../theme/base-themed-ctrl';


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


export abstract class BaseAction<S extends typeof $> extends BaseThemedCtrl<S> {
  constructor(
      private readonly disabledDomOutput: Output<boolean>,
      context: PersonaContext,
      specs: S,
  ) {
    super(context, specs);
    this.addSetup(this.renderDisabledDomOutput$);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.host.ariaDisabled(this.ariaDisabled$),
      this.renderers.host.action1(
          this.baseActionInputs.host.isSecondary.pipe(map(isSecondary => !isSecondary)),
      ),
      this.renderers.host.action2(this.baseActionInputs.host.isSecondary),
    ];
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
