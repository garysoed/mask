import {forwardTo} from 'gs-tools/export/rxjs';
import {Bindings} from 'persona';
import {ReversedSpec} from 'persona/export/internal';
import {concat, Observable, Subject} from 'rxjs';
import {map, take} from 'rxjs/operators';

import {BaseInputSpecType} from '../../src/input/base-input';


type InputBindings<T> = Bindings<ReversedSpec<BaseInputSpecType<T, any>['host']>, any>;

export function bindInputToState<T>(
    resolver: Subject<T>,
    bindings: InputBindings<T>,
): Observable<unknown> {
  const inputBinding = bindInput(resolver, bindings.value);
  const outputBinding = bindOutput(resolver, bindings);

  return concat(outputBinding, inputBinding);
}

function bindInput<T>(subject: Subject<T>, obs: Observable<T>): Observable<unknown> {
  return obs.pipe(forwardTo(subject));
}

function bindOutput<T>(
    resolver: Observable<T>,
    bindings: InputBindings<T>,
): Observable<unknown> {
  return resolver.pipe(
      take(1),
      map(value => [value] as const),
      bindings.setValue(),
  );
}