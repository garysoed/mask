import { Vine } from '@grapevine';
import { attributeIn, element, handler, InitFn } from '@persona';
import { Output } from '@persona/internal';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, skip, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../../app/app';
import { stringParser } from '../../util/parsers';
import { $$ as $baseAction, BaseAction } from '../base-action';

export const $$ = {
  ...$baseAction,
  clearFn: handler<[]>('clear'),
  label: attributeIn('label', stringParser(), ''),
};

export const $ = {
  host: element($$),
};

@_p.baseCustomElement({})
export abstract class BaseInput<T> extends BaseAction {
  protected readonly isDirtyObs = _v.stream(this.providesIsDirty, this).asObservable();
  protected readonly labelObs = _p.input($.host._.label, this);
  protected readonly onClearObs = _p.input($.host._.clearFn, this);
  protected readonly shouldSetInitValueObs = _v.stream(this.providesInitValue, this).asObservable();

  constructor(
      private readonly labelOutput: Output<string>,
      private readonly valueOutput: Output<T>,
      disabledOutput: Output<boolean>,
      shadowRoot: ShadowRoot,
  ) {
    super(disabledOutput, shadowRoot);
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render(this.labelOutput).withObservable(this.labelObs),
      _p.render(this.valueOutput).withVine(_v.stream(this.renderHostValue, this)),
      vine => this.setupUpdateInitValue(vine),
    ];
  }

  /**
   * Emits the current value of the input.
   */
  protected abstract getCurrentValueObs(vine: Vine): Observable<T>;

  protected abstract getInitValueObs(vine: Vine): Observable<T>;

  protected abstract updateCurrentValue(value: T, vine: Vine): Observable<unknown>;

  private providesInitValue(vine: Vine): Observable<T> {
    const initValueObs = this.getInitValueObs(vine);

    // Set the initial value when:
    // 1.  clear is called
    // 2.  Whenever init value is changed, but user has not interacted with the input element.
    return merge(
        this.onClearObs,
        initValueObs.pipe(
            withLatestFrom(this.isDirtyObs),
            filter(([, isDirty]) => !isDirty),
        ),
    )
    .pipe(
        startWith(),
        withLatestFrom(initValueObs),
        map(([, initValue]) => initValue),
    );
  }

  private providesIsDirty(vine: Vine): Observable<boolean> {
    return merge(
        this.getCurrentValueObs(vine)
          .pipe(
              // Skips the initial value.
              skip(1),
              mapTo(true),
          ),
        this.onClearObs.pipe(mapTo(false)),
    )
    .pipe(startWith(false));
  }

  private renderHostValue(vine: Vine): Observable<T> {
    return merge(this.shouldSetInitValueObs, this.getCurrentValueObs(vine));
  }

  private setupUpdateInitValue(vine: Vine): Observable<unknown> {
    return this.shouldSetInitValueObs
        .pipe(
            switchMap(initValue => this.updateCurrentValue(initValue, vine)),
        );
  }
}
