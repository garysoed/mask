import {filterNonNullable, forwardTo} from 'gs-tools/export/rxjs';
import {Bindings} from 'persona';
import {ReversedSpec} from 'persona/export/internal';
import {concat, merge, Observable, Subject} from 'rxjs';
import {map, take} from 'rxjs/operators';

import {BaseInputSpecType} from '../../src/input/base-input';

type RadioBindingLike = Pick<
Bindings<ReversedSpec<BaseInputSpecType<string|null>['host']>, any>,
'setValue'|'value'
>;

export function bindRadioInputToState(
    resolver: Subject<string|null>,
    bindings: readonly RadioBindingLike[],
): Observable<unknown> {
  return concat(
      bindOutput(resolver, bindings),
      bindInput(resolver, bindings),
  );
}

function bindInput(
    subject: Subject<string|null>,
    bindings: readonly RadioBindingLike[],
): Observable<unknown> {
  const obs$List = bindings.map(binding => binding.value.pipe(
      filterNonNullable(),
      forwardTo(subject),
  ));
  return merge(...obs$List);
}

function bindOutput(
    resolver: Subject<string|null>,
    bindings: readonly RadioBindingLike[],
): Observable<unknown> {
  const obs$List = bindings.map(binding => resolver.pipe(
      take(1),
      map(value => [value] as const),
      binding.setValue(),
  ));
  return merge(...obs$List);
}