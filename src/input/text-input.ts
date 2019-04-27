import { Vine } from '@grapevine';
import { InstanceofType } from '@gs-types';
import { attributeIn, attributeOut, element, innerHtml, onInput } from '@persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, startWith, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { booleanParser, stringParser } from '../util/parsers';
import { $$ as $baseInput, BaseInput } from './base-input';
import textInputTemplate from './text-input.html';

export const $$ = {
  ...$baseInput,
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
  label: element('label', InstanceofType(HTMLLabelElement), {
    innerHtml: innerHtml(),
  }),
};

const DEBOUNCE_MS = 250;
export const $debounceMs = _v.source(() => new BehaviorSubject(DEBOUNCE_MS), globalThis);

@_p.customElement({
  tag: 'mk-text-input',
  template: textInputTemplate,
})
export class TextInput extends BaseInput<string> {
  private readonly initValueObs = _p.input($.host._.initValue, this);
  private readonly inputElObs = _p.input($.input, this);
  private readonly onInputObs = _p.input($.input._.onInput, this);

  constructor(root: ShadowRoot) {
    super($.input._.disabled, $.label._.innerHtml, $.host._.value, root);
  }

  protected getCurrentValueObs(vine: Vine): Observable<string> {
    return this.inputElObs
        .pipe(
            withLatestFrom($debounceMs.get(vine)),
            switchMap(([el, debounceMs]) => this.onInputObs
                .pipe(
                    debounceTime(debounceMs),
                    startWith(el.value),
                )),
        );
  }

  protected getInitValueObs(): Observable<string> {
    return this.initValueObs;
  }

  protected updateCurrentValue(value: string): Observable<unknown> {
    return this.inputElObs.pipe(take(1), tap(el => el.value = value));
  }
}
