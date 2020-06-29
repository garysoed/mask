import { cache } from 'gs-tools/export/data';
import { attributeIn, handler, host, PersonaContext, stringParser } from 'persona';
import { AttributeInput, Output, PropertyEmitter } from 'persona/export/internal';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { _p } from '../../app/app';
import { $$ as $baseAction, BaseAction } from '../base-action';

export interface Value<T> {
  readonly trigger: 'input'|'default';
  readonly value: T;
}

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
  private readonly value_$ = new ReplaySubject<Value<T>>(1);
  protected readonly onInputValue$ = new Subject<T>();

  constructor(
      private readonly defaultValueInput: AttributeInput<T>,
      disabledOutput: Output<boolean>,
      private readonly labelOutput: Output<string>,
      valueEmitter: PropertyEmitter<Value<T>>,
      context: PersonaContext,
  ) {
    super(disabledOutput, context);

    this.addSetup(this.setupHandleOnClear());
    this.addSetup(this.setDefaultValue());
    this.addSetup(this.setForwardInputValue());
    this.render(valueEmitter, this.value_$);
    this.render(this.labelOutput, this.label$);
  }

  protected abstract updateDomValue(newValue: T): Observable<unknown>;

  protected get value$(): Observable<Value<T>> {
    return this.value_$;
  }

  @cache()
  private get defaultValue$(): Observable<T> {
    return this.declareInput(this.defaultValueInput);
  }

  private setDefaultValue(): Observable<unknown> {
    return this.defaultValue$.pipe(
        take(1),
        switchMap(defaultValue => {
          this.value_$.next({trigger: 'default', value: defaultValue});
          return this.updateDomValue(defaultValue);
        }),
    );
  }

  private setForwardInputValue(): Observable<unknown> {
    return this.onInputValue$.pipe(
        tap(value => {
          this.value_$.next({trigger: 'input', value});
        }),
    );
  }

  private setupHandleOnClear(): Observable<unknown> {
    return this.onClear$.pipe(
        switchMap(() => this.setDefaultValue()),
    );
  }
}
