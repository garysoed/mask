import {forwardTo} from 'gs-tools/export/rxjs';
import {instanceofType} from 'gs-types';
import {Bindings, Context, Ctrl, ivalue} from 'persona';
import {IValue} from 'persona/export/internal';
import {BehaviorSubject, merge, Observable, OperatorFunction, Subject} from 'rxjs';
import {distinctUntilChanged, skip, switchMap} from 'rxjs/operators';

import {$baseRootOutputs, BaseAction, BaseActionSpecType, create$baseAction} from '../action/base-action';


export interface BaseInputSpecType<Type, Action> extends BaseActionSpecType<Action> {
  host: BaseActionSpecType<Action>['host'] & {
    readonly value: IValue<Subject<Type>, 'value'>;
  }
}

export function create$baseInput<Action, Type = never>(defaultValue: Type): BaseInputSpecType<Type, Action> {
  return {
    host: {
      ...create$baseAction<Action>().host,
      value: ivalue('value', instanceofType<Subject<Type>>(Subject), () => new BehaviorSubject(defaultValue)),
    },
  };
}


export abstract class BaseInput<T, A> extends BaseAction<A> implements Ctrl {
  constructor(
      protected readonly inputContext: Context<BaseInputSpecType<T, A>>,
      renderDisabled: () => OperatorFunction<boolean, unknown>,
      rootBindings: Bindings<typeof $baseRootOutputs, any>,
  ) {
    super(inputContext, renderDisabled, rootBindings);
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.inputContext.host.value.pipe(
          switchMap(subject => {
            const fromHostToDom$ = subject.pipe(
                distinctUntilChanged(),
                this.updateDomValue(),
            );

            const fromDomToHost$ = this.domValue$.pipe(
                // Skips the initial emission.
                skip(1),
                distinctUntilChanged(),
                forwardTo(subject),
            );

            // ORDERING MATTERS!
            return merge(fromDomToHost$, fromHostToDom$);
          }),
      ),
    ];
  }

  protected abstract get domValue$(): Observable<T>;

  protected abstract updateDomValue(): OperatorFunction<T, unknown>;
}
