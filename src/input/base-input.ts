import {cache} from 'gs-tools/export/data';
import {Type, unknownType} from 'gs-types';
import {icall, oevent} from 'persona';
import {ivalue} from 'persona/src/input/value';
import {ovalue} from 'persona/src/output/value';
import {Bindings, Context, Ctrl, UnresolvedIO} from 'persona/src/types/ctrl';
import {ICall, IValue, OEvent, OValue} from 'persona/src/types/io';
import {Observable, OperatorFunction} from 'rxjs';
import {filter, map, pairwise, startWith, withLatestFrom} from 'rxjs/operators';

import {$baseRootOutputs, BaseAction, BaseActionSpecType, create$baseAction} from '../action/base-action';
import {ChangeEvent, CHANGE_EVENT} from '../event/change-event';


export interface BaseInputSpecType<T, A> extends BaseActionSpecType<A> {
  host: BaseActionSpecType<A>['host'] & {
    readonly clearFn: UnresolvedIO<HTMLElement, ICall<unknown, 'clearFn'>>;
    readonly initValue: UnresolvedIO<HTMLElement, IValue<T, 'initValue'>>;
    readonly onChange: UnresolvedIO<HTMLElement, OEvent<ChangeEvent<T>>>;
    readonly value: UnresolvedIO<HTMLElement, OValue<T, 'value'>>;
  }
}


export function create$baseInput<T, A>(valueType: Type<T>, defaultValue: T): BaseInputSpecType<T, A> {
  return {
    host: {
      ...create$baseAction<A>().host,
      clearFn: icall('clearFn', unknownType),
      initValue: ivalue('initValue', valueType, defaultValue),
      onChange: oevent(CHANGE_EVENT, ChangeEvent),
      value: ovalue('value', valueType, defaultValue),
    },
  };
}


export abstract class BaseInput<T, A> extends BaseAction<A> implements Ctrl {
  constructor(
      protected readonly inputContext: Context<BaseInputSpecType<T, A>>,
      renderDisabled: () => OperatorFunction<boolean, unknown>,
      rootBindings: Bindings<typeof $baseRootOutputs>,
  ) {
    super(inputContext, renderDisabled, rootBindings);
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.handleOnClear$,
      this.onChange$.pipe(this.inputContext.host.onChange()),
      this.domValue$.pipe(this.inputContext.host.value()),
    ];
  }

  protected abstract get domValue$(): Observable<T>;

  protected abstract updateDomValue(): OperatorFunction<T, unknown>;

  @cache()
  private get handleOnClear$(): Observable<unknown> {
    return this.inputContext.host.clearFn.pipe(
        startWith({}),
        withLatestFrom(this.inputContext.host.initValue),
        map(([, value]) => value),
        this.updateDomValue(),
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
