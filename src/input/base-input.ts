import {cache} from 'gs-tools/export/data';
import {Type} from 'gs-types';
import {Bindings, Context, Ctrl, icall, oevent, ovalue} from 'persona';
import {ICall, OEvent, OValue} from 'persona/export/internal';
import {Observable, OperatorFunction} from 'rxjs';
import {filter, map, pairwise} from 'rxjs/operators';

import {$baseRootOutputs, BaseAction, BaseActionSpecType, create$baseAction} from '../action/base-action';
import {ChangeEvent, CHANGE_EVENT} from '../event/change-event';


export interface BaseInputSpecType<T> extends BaseActionSpecType {
  host: BaseActionSpecType['host'] & {
    readonly onChange: OEvent<ChangeEvent<T>>;
    readonly setValue: ICall<readonly [T], 'setValue'>;
    readonly value: OValue<T, 'value'>;
  }
}

export function create$baseInput<T>(valueType: Type<T>, defaultValue: T): BaseInputSpecType<T> {
  return {
    host: {
      ...create$baseAction().host,
      onChange: oevent(CHANGE_EVENT, ChangeEvent),
      setValue: icall('setValue', [valueType] as const),
      value: ovalue('value', valueType, () => defaultValue),
    },
  };
}


export abstract class BaseInput<T> extends BaseAction implements Ctrl {
  constructor(
      protected readonly inputContext: Context<BaseInputSpecType<T>>,
      renderDisabled: () => OperatorFunction<boolean, unknown>,
      rootBindings: Bindings<typeof $baseRootOutputs, any>,
  ) {
    super(inputContext, renderDisabled, rootBindings);
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.handleSetValue$,
      this.onChange$.pipe(this.inputContext.host.onChange()),
      this.domValue$.pipe(this.inputContext.host.value()),
    ];
  }

  protected abstract get domValue$(): Observable<T>;

  protected abstract updateDomValue(): OperatorFunction<T, unknown>;

  @cache()
  private get handleSetValue$(): Observable<unknown> {
    return this.inputContext.host.setValue.pipe(
        map(([value]) => value),
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
