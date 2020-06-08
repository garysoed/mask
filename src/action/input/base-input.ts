import { cache } from 'gs-tools/export/data';
import { attributeIn, handler, host, PersonaContext, stringParser } from 'persona';
import { AttributeInput, Output } from 'persona/export/internal';
import { PropertyEmitter } from 'persona/src/output/property-emitter';
import { Observable, ReplaySubject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { _p } from '../../app/app';
import { $$ as $baseAction, BaseAction } from '../base-action';

export const DEFAULT_VALUE_ATTR_NAME = 'default-value';
export const VALUE_PROPERTY_NAME = 'value$';

export const $$ = {
  api: {
    ...$baseAction.api,
    clearFn: handler('clear'),
    label: attributeIn('label', stringParser(), ''),
  },
};

export const $ = {
  host: host($$.api),
};

@_p.baseCustomElement({})
export abstract class BaseInput<T> extends BaseAction {
  protected readonly label$ = this.declareInput($.host._.label);
  protected readonly onClear$ = this.declareInput($.host._.clearFn);
  protected readonly value$ = new ReplaySubject<T>(1);

  constructor(
      private readonly defaultValueInput: AttributeInput<T>,
      disabledOutput: Output<boolean>,
      private readonly labelOutput: Output<string>,
      valueEmitter: PropertyEmitter<T>,
      context: PersonaContext,
  ) {
    super(disabledOutput, context);

    this.addSetup(this.setupHandleOnClear());
    this.addSetup(this.setDefaultValue());
    this.render(valueEmitter, this.value$);
    this.render(this.labelOutput, this.label$);
  }

  protected abstract updateDomValue(newValue: T): Observable<unknown>;

  @cache()
  private get defaultValue$(): Observable<T> {
    return this.declareInput(this.defaultValueInput);
  }

  private setDefaultValue(): Observable<unknown> {
    return this.defaultValue$.pipe(
        take(1),
        switchMap(defaultValue => {
          this.value$.next(defaultValue);
          return this.updateDomValue(defaultValue);
        }),
    );
  }

  private setupHandleOnClear(): Observable<unknown> {
    return this.onClear$.pipe(
        switchMap(() => this.setDefaultValue()),
    );
  }
}
