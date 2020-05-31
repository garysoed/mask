import { cache } from 'gs-tools/export/data';
import { Converter, SuccessResult } from 'nabu';
import { attributeIn, emitter, handler, host, PersonaContext, stringParser } from 'persona';
import { Output } from 'persona/export/internal';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

import { _p } from '../../app/app';
import { $$ as $baseAction, BaseAction } from '../base-action';


export const $$ = {
  api: {
    ...$baseAction.api,
    clearFn: handler('clear'),
    defaultValue: attributeIn('default-value', stringParser(), ''),
    label: attributeIn('label', stringParser(), ''),
    value: emitter('value$'),
  },
};

export const $ = {
  host: host($$.api),
};

@_p.baseCustomElement({})
export abstract class BaseInput<T> extends BaseAction {
  protected readonly label$ = this.declareInput($.host._.label);
  protected readonly onClear$ = this.declareInput($.host._.clearFn);
  protected readonly value$ = new ReplaySubject<T>(1);

  constructor(
      private readonly defaultValueConverter: Converter<T, string>,
      private readonly labelOutput: Output<string>,
      disabledOutput: Output<boolean>,
      context: PersonaContext,
  ) {
    super(disabledOutput, context);

    this.addSetup(this.setupHandleOnClear());
    this.addSetup(this.setDefaultValue());
    this.render($.host._.value, this.value$);
    this.render(this.labelOutput, this.label$);
  }

  protected abstract updateDomValue(newValue: T): Observable<unknown>;

  @cache()
  private get defaultValue$(): Observable<T> {
    return this.declareInput($.host._.defaultValue).pipe(
        map(raw => this.defaultValueConverter.convertBackward(raw)),
        filter((result): result is SuccessResult<T> => result.success),
        map(({result}) => result),
    );
  }

  private setDefaultValue(): Observable<unknown> {
    return this.defaultValue$.pipe(
        take(1),
        switchMap(defaultValue => {
          this.value$.next(defaultValue);
          return this.updateDomValue(defaultValue);
        }),
    );
  }

  private setupHandleOnClear(): Observable<unknown> {
    return this.onClear$.pipe(
        switchMap(() => this.setDefaultValue()),
    );
  }
}
