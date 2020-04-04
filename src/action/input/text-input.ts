import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, booleanParser, element, enumParser, innerHtml, onInput, PersonaContext, stringParser } from 'persona';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

import { _p } from '../../app/app';

import { $$ as $baseInput, BaseInput } from './base-input';
import template from './text-input.html';


enum InputType {
  EMAIL = 'email',
  NUMBER = 'number',
  TEL = 'tel',
  TEXT = 'text',
  URL = 'url',
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
  input: element('input', instanceofType(HTMLInputElement), {
    autocomplete: attributeOut('autocomplete', stringParser()),
    disabled: attributeOut('disabled', booleanParser(), false),
    // TODO: This should cause compile error if the Element type is not InputElement.
    onInput: onInput(),
    type: attributeOut('type', enumParser(InputType)),
  }),
  label: element('label', instanceofType(HTMLLabelElement), {
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
  private readonly onInput$ = this.declareInput($.input._.onInput);
  private readonly type$ = this.declareInput($.host._.type);

  constructor(context: PersonaContext) {
    super(
        $.host._.initValue,
        $.host._.value,
        $.label._.innerHtml,
        $.input._.disabled,
        context,
    );

    this.render($.input._.type, this.type$);
    this.render($.input._.autocomplete, this.autocomplete$);
    this.setupHandleInput();
  }

  protected setupUpdateValue(value$: Observable<string>): void {
    combineLatest([value$, this.declareInput($.input)])
        .pipe(takeUntil(this.onDispose$))
        .subscribe(([value, el]) => {
          el.value = value;
        });
  }

  private setupHandleInput(): void {
    this.declareInput($.input)
        .pipe(
            switchMap(() => this.onInput$),
            debounceTime(DEBOUNCE_MS),
            takeUntil(this.onDispose$),
        )
        .subscribe(value => this.dirtyValue$.next(value));
  }
}
