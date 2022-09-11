import {filterNonNullable} from 'gs-tools/export/rxjs';
import {MutableResolver} from 'gs-tools/export/state';
import {Bindings} from 'persona';
import {ReversedSpec} from 'persona/export/internal';
import {concat, merge, Observable} from 'rxjs';
import {take, map} from 'rxjs/operators';

import {BaseInputSpecType} from '../../src/input/base-input';

type RadioBindingLike = Pick<
Bindings<ReversedSpec<BaseInputSpecType<string|null, any>['host']>, any>,
'setValue'|'value'
>;

export function bindRadioInputToState(
    resolver: MutableResolver<string|null>,
    bindings: readonly RadioBindingLike[],
): Observable<unknown> {
  return concat(
      bindOutput(resolver, bindings),
      bindInput(resolver, bindings),
  );
}

function bindInput(
    resolver: MutableResolver<string|null>,
    bindings: readonly RadioBindingLike[],
): Observable<unknown> {
  const obs$List = bindings.map(binding => binding.value.pipe(
      filterNonNullable(),
      resolver.set(),
  ));
  return merge(...obs$List);
}

function bindOutput(
    resolver: MutableResolver<string|null>,
    bindings: readonly RadioBindingLike[],
): Observable<unknown> {
  const obs$List = bindings.map(binding => resolver.pipe(
      take(1),
      map(value => [value] as const),
      binding.setValue(),
  ));
  return merge(...obs$List);
}