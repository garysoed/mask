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

enum AutocompleteType {
  ADDITIONAL_NAME = 'additional-name',
  CURRENT_PASSWORD = 'current-password',
  EMAIL = 'email',
  FAMILY_NAME = 'family-name',
  GIVEN_NAME = 'given-name',
  HONORIFIC_PREFIX = 'honorific-prefix',
  HONORIFIC_SUFFIX = 'honorific-suffix',
  NAME = 'name',
  NEW_PASSWORD = 'new-password',
  NICKNAME = 'nickname',
  OFF = 'off',
  ON = 'on',
  ONE_TIME_CODE = 'one-time-code',
  ORGANIZATION = 'organization',
  ORGANIZATTION_TITLE = 'organization-title',
  USERNAME = 'username',
}

export const $$ = {
  ...$baseInput,
  autocomplete: attributeIn('autocomplete', enumParser(AutocompleteType), 'off'),
  initValue: attributeIn('init-value', stringParser(), ''),
  type: attributeIn('type', enumParser(InputType), InputType.TEXT),
  value: attributeOut('value', stringParser()),
};

export const $ = {
  host: element($$),
  input: element('input', InstanceofType(HTMLInputElement), {
    autocomplete: attributeOut('autocomplete', stringParser()),
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
  private readonly autocomplete$ = _p.input($.host._.autocomplete, this);
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
      _p.render($.input._.autocomplete).withObservable(this.autocomplete$),
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
