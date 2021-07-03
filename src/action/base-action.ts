import {cache} from 'gs-tools/export/data';
import {attributeOut, hasAttribute, host, InputsOf, PersonaContext, setAttribute, stringParser} from 'persona';
import {Input, Output} from 'persona/export/internal';
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

export interface BaseInputOutputs {
  disabled: Input<boolean>;
  isSecondary: Input<boolean>;
  ariaDisabled: Output<string>;
  action1: Output<boolean>;
  action2: Output<boolean>;
}


export abstract class BaseAction<S extends typeof $> extends BaseThemedCtrl<S> {
  constructor(
      private readonly disabledDomOutput: Output<boolean>,
      context: PersonaContext,
      specs: S,
      private readonly inputOutputs: BaseInputOutputs,
  ) {
    super(context, specs);
    this.addSetup(this.renderDisabledDomOutput$);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.ariaDisabled$.pipe(this.inputOutputs.ariaDisabled.output(this.context)),
      this.baseActionInputs.host.isSecondary.pipe(
          map(isSecondary => !isSecondary),
          this.inputOutputs.action1.output(this.context),
      ),
      this.baseActionInputs.host.isSecondary.pipe(
          this.inputOutputs.action2.output(this.context),
      ),
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
