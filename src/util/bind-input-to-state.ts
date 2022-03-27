import {MutableResolver} from 'gs-tools/export/state';
import {Bindings} from 'persona';
import {ReversedSpec} from 'persona/export/internal';
import {concat, Observable} from 'rxjs';
import {take} from 'rxjs/operators';

import {BaseInputSpecType} from '../input/base-input';


type InputBindings<T> = Bindings<ReversedSpec<BaseInputSpecType<T, any>['host']>, any>;

export function bindInputToState<T>(
    resolver: MutableResolver<T>,
    bindings: InputBindings<T>,
): Observable<unknown> {
  const inputBinding = bindInput(resolver, bindings.value);
  const outputBinding = bindOutput(resolver, bindings);

  return concat(outputBinding, inputBinding);
}

function bindInput<T>(resolver: MutableResolver<T>, obs: Observable<T>): Observable<unknown> {
  return obs.pipe(resolver.set());
}

function bindOutput<T>(
    resolver: MutableResolver<T>,
    bindings: InputBindings<T>,
): Observable<unknown> {
  return resolver.pipe(
      take(1),
      bindings.initValue(),
      bindings.clearFn(),
  );
}