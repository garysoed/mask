import { Vine } from '@grapevine';
import { InstanceofType } from '@gs-types';
import { attributeIn, attributeOut, element, InitFn, innerHtml, onInput } from '@persona';
import { BehaviorSubject, Observable } from '@rxjs';
import { debounceTime, startWith, switchMap, take, tap, withLatestFrom } from '@rxjs/operators';

import { _p, _v } from '../../app/app';
import { booleanParser, enumParser, stringParser } from '../../util/parsers';

import { $$ as $baseInput, BaseInput } from './base-input';
import template from './text-input.html';

enum InputType {
  NUMBER = 'number',
  TEXT = 'text',
}

export const $$ = {
  ...$baseInput,
  initValue: attributeIn('init-value', stringParser(), ''),
  type: attributeIn('type', enumParser(InputType), InputType.TEXT),
  value: attributeOut('value', stringParser()),
};

export const $ = {
  host: element($$),
  input: element('input', InstanceofType(HTMLInputElement), {
    disabled: attributeOut('disabled', booleanParser(), false),
    // TODO: This should cause compile error if the Element type is not InputElement.
    onInput: onInput(),
    type: attributeOut('type', enumParser(InputType)),
  }),
  label: element('label', InstanceofType(HTMLLabelElement), {
    innerHtml: innerHtml(),
  }),
};

export const DEBOUNCE_MS = 250;
export const $debounceMs = _v.source(() => new BehaviorSubject(DEBOUNCE_MS), globalThis);

@_p.customElement({
  tag: 'mk-text-input',
  template,
})
export class TextInput extends BaseInput<string> {
  private readonly initValue$ = _p.input($.host._.initValue, this);
  private readonly inputEl$ = _p.input($.input, this);
  private readonly onInput$ = _p.input($.input._.onInput, this);
  private readonly type$ = _p.input($.host._.type, this);

  constructor(root: ShadowRoot) {
    super(
        $.label._.innerHtml,
        $.host._.value,
        $.input._.disabled,
        root,
    );
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.input._.type).withObservable(this.type$),
    ];
  }

  protected getCurrentValueObs(vine: Vine): Observable<string> {
    return this.inputEl$
        .pipe(
            withLatestFrom($debounceMs.get(vine)),
            switchMap(([el, debounceMs]) => this.onInput$
                .pipe(
                    debounceTime(debounceMs),
                    startWith(el.value),
                )),
        );
  }

  protected getInitValueObs(): Observable<string> {
    return this.initValue$;
  }

  protected updateCurrentValue(value: string): Observable<unknown> {
    return this.inputEl$.pipe(take(1), tap(el => el.value = value));
  }
}
