import { cache } from 'gs-tools/export/data';
import { StateId } from 'gs-tools/export/state';
import { attributeIn, booleanParser, handler, host, PersonaContext } from 'persona';
import { AttributeInput, DispatcherOutput, Output } from 'persona/export/internal';
import { combineLatest, merge, Observable, of as observableOf, Subject } from 'rxjs';
import { filter, map, pairwise, startWith, switchMap, switchMapTo, tap, withLatestFrom } from 'rxjs/operators';

import { _p } from '../../app/app';
import { $stateService } from '../../core/state-service';
import { ChangeEvent } from '../../event/change-event';
import { $$ as $baseAction, BaseAction } from '../base-action';


export const STATE_ID_ATTR_NAME = 'state-id';

export const $baseInput = {
  api: {
    ...$baseAction.api,
    applyFn: handler('apply'),
    applyOnChange: attributeIn('apply-on-change', booleanParser()),
    clearFn: handler('clear'),
  },
};

export const $ = {
  host: host($baseInput.api),
};

@_p.baseCustomElement({})
export abstract class BaseInput<T> extends BaseAction {
  protected readonly onDomValueUpdatedByScript$ = new Subject<unknown>();
  private readonly stateId$ = this.declareInput(this.$stateId);

  constructor(
      private readonly defaultValue: T,
      disabledDomOutput: Output<boolean>,
      private readonly $stateId: AttributeInput<StateId<T>|undefined>,
      $onChangeOutput: DispatcherOutput<ChangeEvent<T>>,
      context: PersonaContext,
  ) {
    super(disabledDomOutput, context);

    this.addSetup(this.handleOnApply$);
    this.addSetup(this.handleOnClear$);
    this.render($onChangeOutput, this.onChange$);
  }

  protected abstract get domValue$(): Observable<T>;

  protected abstract updateDomValue(newValue: T): Observable<unknown>;

  @cache()
  private get currentStateValue$(): Observable<T> {
    return combineLatest([
      $stateService.get(this.vine),
      this.stateId$,
    ])
    .pipe(
        switchMap(([stateService, $stateId]) => {
          if (!$stateId) {
            return observableOf(null);
          }

          return stateService.get($stateId);
        }),
        map(value => value ?? this.defaultValue),
    );
  }

  @cache()
  private get handleOnApply$(): Observable<unknown> {
    const onAutoApply$ = this.declareInput($.host._.applyOnChange).pipe(
        filter(applyOnChange => !!applyOnChange),
        switchMapTo(this.onChange$),
    );

    return merge(
        this.declareInput($.host._.applyFn),
        onAutoApply$,
    )
    .pipe(
        withLatestFrom(this.domValue$, this.stateId$, $stateService.get(this.vine)),
        tap(([, domValue, stateId, stateService]) => {
          if (!stateId) {
            return;
          }

          stateService.set(stateId, domValue);
        }),
    );
  }

  @cache()
  private get handleOnClear$(): Observable<unknown> {
    return this.declareInput($.host._.clearFn).pipe(
        startWith({}),
        withLatestFrom(this.currentStateValue$),
        switchMap(([, value]) => this.updateDomValue(value)),
        tap(() => {
          this.onDomValueUpdatedByScript$.next();
        }),
    );
  }

  @cache()
  protected get onChange$(): Observable<ChangeEvent<T>> {
    return this.domValue$.pipe(
        pairwise(),
        filter(([oldValue, newValue]) => oldValue !== newValue),
        map(([oldValue]) => new ChangeEvent(oldValue)),
    );
  }

}
