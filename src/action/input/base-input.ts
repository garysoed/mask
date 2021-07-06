import {$stateService2} from 'grapevine/src/core/state';
import {cache} from 'gs-tools/export/data';
import {debug} from 'gs-tools/export/rxjs';
import {ObjectPath} from 'gs-tools/export/state';
import {handler, host, InputsOf, PersonaContext} from 'persona';
import {AttributeInput, DispatcherOutput, Output} from 'persona/export/internal';
import {merge, Observable, Subject} from 'rxjs';
import {filter, map, pairwise, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {_p} from '../../app/app';
import {ChangeEvent} from '../../event/change-event';
import {$baseAction as $baseAction, BaseAction, BaseInputOutputs} from '../base-action';


export const STATE_ID_ATTR_NAME = 'state-id';

export const $baseInput = {
  api: {
    ...$baseAction.api,
    applyFn: handler('apply'),
    clearFn: handler('clear'),
  },
};

export const $ = {
  host: host($baseInput.api),
};

@_p.baseCustomElement({})
export abstract class BaseInput<T, S extends typeof $> extends BaseAction<S> {
  private readonly statePath$ = this.statePathInput.getValue(this.context).pipe(debug(null, 'statePath'));

  constructor(
      private readonly defaultValue: T,
      disabledDomOutput: Output<boolean>,
      private readonly statePathInput: AttributeInput<ObjectPath<T>|undefined>,
      private readonly onChangeOutput: DispatcherOutput<ChangeEvent<T>>,
      context: PersonaContext,
      specs: S,
      inputOutputs: BaseInputOutputs,
  ) {
    super(disabledDomOutput, context, specs, inputOutputs);

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
    return $stateService2.get(this.vine).$(this.statePath$).pipe(
        debug(null, 'statePathValue'),
        map(value => value ?? this.defaultValue),
    );
  }

  @cache()
  private get handleOnApply$(): Observable<unknown> {
    return merge(
        this.baseInputInputs.host.applyFn,
        this.onChange$,
    )
        .pipe(
            withLatestFrom(this.domValue$),
            map(([, domValue]) => domValue),
            $stateService2.get(this.vine).$(this.statePath$).set(),
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
    return this.onChange$.pipe(this.onChangeOutput.output(this.context));
  }
}
