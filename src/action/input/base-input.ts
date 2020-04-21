import { attributeIn, element, handler, PersonaContext, stringParser } from 'persona';
import { Input, Output } from 'persona/export/internal';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { _p } from '../../app/app';
import { $$ as $baseAction, BaseAction } from '../base-action';


export const $$ = {
  ...$baseAction,
  clearFn: handler('clear'),
  label: attributeIn('label', stringParser(), ''),
};

export const $ = {
  host: element($$),
};

@_p.baseCustomElement({})
export abstract class BaseInput<T> extends BaseAction {
  protected readonly dirtyValue$ = new ReplaySubject<T>(1);
  protected readonly isDirty$ = new BehaviorSubject(false);
  protected readonly label$ = this.declareInput($.host._.label);
  protected readonly onClear$ = this.declareInput($.host._.clearFn);
  protected readonly value$: Observable<T>;
  private readonly initValue$: Observable<T>;

  constructor(
      initValueInput: Input<T>,
      private readonly hostValueOutput: Output<T>,
      private readonly labelOutput: Output<string>,
      disabledOutput: Output<boolean>,
      context: PersonaContext,
  ) {
    super(disabledOutput, context);
    this.initValue$ = this.declareInput(initValueInput);
    this.value$ = this.createValue();

    this.addSetup(this.setupHandleOnClear());
    this.addSetup(this.setupUpdateValue(this.value$));
    this.addSetup(this.setupUpdateIsDirty());
    this.render(this.labelOutput, this.label$);
    this.render(this.hostValueOutput, this.value$);
  }

  protected abstract setupUpdateValue(value$: Observable<T>): Observable<unknown>;

  private createValue(): Observable<T> {
    return this.isDirty$.pipe(
        switchMap(isDirty => isDirty ? this.dirtyValue$ : this.initValue$),
    );
  }

  private setupHandleOnClear(): Observable<unknown> {
    return this.onClear$.pipe(tap(() => this.isDirty$.next(false)));
  }

  private setupUpdateIsDirty(): Observable<unknown> {
    return this.dirtyValue$.pipe(tap(() => this.isDirty$.next(true)));
  }
}
