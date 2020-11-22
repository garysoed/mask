import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {handler, hasAttribute, host, InputsOf, PersonaContext} from 'persona';
import {AttributeInput, DispatcherOutput, Output} from 'persona/export/internal';
import {combineLatest, EMPTY, merge, Observable, of as observableOf, Subject} from 'rxjs';
import {filter, map, pairwise, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {_p} from '../../app/app';
import {$stateService} from '../../core/state-service';
import {ChangeEvent} from '../../event/change-event';
import {$baseAction as $baseAction, BaseAction} from '../base-action';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = new Logger('mask.BaseInput');

export const STATE_ID_ATTR_NAME = 'state-id';

export const $baseInput = {
  api: {
    ...$baseAction.api,
    applyFn: handler('apply'),
    applyOnChange: hasAttribute('apply-on-change'),
    clearFn: handler('clear'),
  },
};

export const $ = {
  host: host($baseInput.api),
};

@_p.baseCustomElement({})
export abstract class BaseInput<T, S extends typeof $> extends BaseAction<S> {
  private readonly stateId$ = this.$stateId.getValue(this.context);

  constructor(
      private readonly defaultValue: T,
      disabledDomOutput: Output<boolean>,
      private readonly $stateId: AttributeInput<StateId<T>|undefined>,
      private readonly $onChangeOutput: DispatcherOutput<ChangeEvent<T>>,
      context: PersonaContext,
      spec: S,
  ) {
    super(disabledDomOutput, context, spec);

    this.addSetup(this.handleOnApply$);
    this.addSetup(this.handleOnClear$);
    this.addSetup(this.renderOnChangeOutput$);
  }

  protected abstract get domValue$(): Observable<T>;

  @cache()
  protected get onDomValueUpdatedByScript$(): Subject<unknown> {
    return new Subject();
  }

  protected abstract updateDomValue(newValue: T): Observable<unknown>;

  @cache()
  private get baseInputInputs(): InputsOf<typeof $> {
    return this.inputs;
  }

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
    const onAutoApply$ = this.baseInputInputs.host.applyOnChange.pipe(
        switchMap(applyOnChange => {
          if (!applyOnChange) {
            return EMPTY;
          }

          return this.onChange$;
        }),
    );

    return merge(
        this.baseInputInputs.host.applyFn,
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
    return this.baseInputInputs.host.clearFn.pipe(
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

  @cache()
  private get renderOnChangeOutput$(): Observable<unknown> {
    return this.onChange$.pipe(this.$onChangeOutput.output(this.context));
  }
}
