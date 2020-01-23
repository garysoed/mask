import { Vine } from '@grapevine';
import { InstanceofType } from '@gs-types';
import { attributeIn, attributeOut, element, InitFn, innerHtml, onInput } from '@persona';
import { combineLatest, Observable } from '@rxjs';
import { debounceTime, switchMap, tap } from '@rxjs/operators';

import { _p } from '../../app/app';
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
  api: {
    ...$baseInput,
    autocomplete: attributeIn('autocomplete', enumParser(AutocompleteType), 'off'),
    initValue: attributeIn('init-value', stringParser(), ''),
    type: attributeIn('type', enumParser(InputType), InputType.TEXT),
    value: attributeOut('value', stringParser()),
  },
  tag: 'mk-text-input',
};

export const $ = {
  host: element($$.api),
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

@_p.customElement({
  tag: $$.tag,
  template,
})
export class TextInput extends BaseInput<string> {
  private readonly autocomplete$ = this.declareInput($.host._.autocomplete);
  private readonly inputEl$ = this.declareInput($.input);
  private readonly onInput$ = this.declareInput($.input._.onInput);
  private readonly type$ = this.declareInput($.host._.type);

  constructor(root: ShadowRoot) {
    super(
        $.host._.initValue,
        $.host._.value,
        $.label._.innerHtml,
        $.input._.disabled,
        root,
    );
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.input._.type).withObservable(this.type$),
      _p.render($.input._.autocomplete).withObservable(this.autocomplete$),
      () => this.setupHandleInput(),
    ];
  }

  protected setupUpdateValue(value$: Observable<string>): Observable<unknown> {
    return combineLatest([value$, this.inputEl$]).pipe(
        tap(([value, el]) => {
          el.value = value;
        }),
    );
  }

  private setupHandleInput(): Observable<string> {
    return this.inputEl$
        .pipe(
            switchMap(() => this.onInput$
                .pipe(
                    debounceTime(DEBOUNCE_MS),
                    tap(value => this.dirtyValue$.next(value)),
                )),
        );
  }
}
