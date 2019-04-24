import { Vine } from '@grapevine';
import { InstanceofType } from '@gs-types';
import { InitFn } from '@persona';
import { attributeIn, element, handler, onInput } from '@persona/input';
import { attributeOut } from '@persona/output';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { debounce, filter, map, mapTo, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
import textInputTemplate from './text-input.html';

export const $$ = {
  clearFn: handler<[]>('clear'),
  disabled: attributeIn('disabled', booleanParser(), false),
  initValue: attributeIn('init-value', stringParser(), ''),
  value: attributeOut('value', stringParser()),
};

export const $ = {
  host: element($$),
  input: element('input', InstanceofType(HTMLInputElement), {
    disabled: attributeOut('disabled', booleanParser(), false),
    // TODO: This should cause compile error if the Element type is not InputElement.
    onInput: onInput(),
  }),
};

const DEBOUNCE_MS = 250;
export const $debounceMs = _v.source(() => new BehaviorSubject(DEBOUNCE_MS), globalThis);

@_p.customElement({
  tag: 'mk-text-input',
  template: textInputTemplate,
})
export class TextInput extends ThemedCustomElementCtrl {
  private readonly disabledObs = _p.input($.host._.disabled, this);
  private readonly initValueObs = _p.input($.host._.initValue, this);
  private readonly inputElObs = _p.input($.input, this);
  private readonly isDirtyObs = _v.stream(this.providesIsDirty, this).asObservable();
  private readonly onClearObs = _p.input($.host._.clearFn, this);
  private readonly onInputObs = _p.input($.input._.onInput, this);
  private readonly shouldSetInitValueObs = _v.stream(this.providesInitValue, this).asObservable();

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.input._.disabled).withObservable(this.disabledObs),
      _p.render($.host._.value).withVine(_v.stream(this.renderHostValue, this)),
      () => this.setupUpdateInputEl(),
    ];
  }

  providesInitValue(): Observable<string> {
    // Set the initial value when:
    // 1.  clear is called
    // 2.  Whenever init value is changed, but user has not interacted with the input element.
    return merge(
        this.onClearObs,
        this.initValueObs.pipe(
            withLatestFrom(this.isDirtyObs),
            filter(([, isDirty]) => !isDirty),
        ),
    )
    .pipe(
        startWith(),
        withLatestFrom(this.initValueObs),
        map(([, initValue]) => initValue),
    );
  }

  providesIsDirty(): Observable<boolean> {
    return merge(
        this.onInputObs.pipe(mapTo(true)),
        this.onClearObs.pipe(mapTo(false)),
    )
    .pipe(startWith(false));
  }

  renderHostValue(vine: Vine): Observable<string> {
    return this.inputElObs
        .pipe(
            debounce(() => $debounceMs.get(vine)),
            switchMap(el => merge(this.shouldSetInitValueObs, this.onInputObs)
                .pipe(startWith(el.value)),
            ),
        );
  }

  setupUpdateInputEl(): Observable<unknown> {
    return this.shouldSetInitValueObs
        .pipe(
            withLatestFrom(this.inputElObs),
            tap(([initValue, inputEl]) => {
              inputEl.value = initValue;
            }),
        );
  }
}
