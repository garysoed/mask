import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, booleanParser, element, emitter, enumParser, handler, host, onInput, PersonaContext, stringParser, textContent } from 'persona';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith, take, tap, withLatestFrom } from 'rxjs/operators';

import { _p } from '../../app/app';

import { $$ as $baseInput, BaseInput, DEFAULT_VALUE_ATTR_NAME, VALUE_PROPERTY_NAME } from './base-input';
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
    ...$baseInput.api,
    autocomplete: attributeIn('autocomplete', enumParser(AutocompleteType), 'off'),
    defaultValue: attributeIn(DEFAULT_VALUE_ATTR_NAME, stringParser(), ''),
    setValidator: handler('setValidator'),
    type: attributeIn('type', enumParser(InputType), InputType.TEXT),
    value: emitter(VALUE_PROPERTY_NAME),
  },
  tag: 'mk-text-input',
};

export const $ = {
  host: host($$.api),
  input: element('input', instanceofType(HTMLInputElement), {
    autocomplete: attributeOut('autocomplete', stringParser()),
    disabled: attributeOut('disabled', booleanParser(), false),
    // TODO: This should cause compile error if the Element type is not InputElement.
    onInput: onInput(),
    type: attributeOut('type', enumParser(InputType)),
  }),
  label: element('label', instanceofType(HTMLLabelElement), {
    text: textContent(),
  }),
};

export const DEBOUNCE_MS = 250;

@_p.customElement({
  ...$$,
  template,
})
export class TextInput extends BaseInput<string> {
  constructor(context: PersonaContext) {
    super(
        $.host._.defaultValue,
        $.input._.disabled,
        $.label._.text,
        $.host._.value,
        context,
    );

    this.render($.input._.type, this.declareInput($.host._.type));
    this.render($.input._.autocomplete, this.declareInput($.host._.autocomplete));
    this.addSetup(this.setupHandleInput());
  }

  protected updateDomValue(newValue: string): Observable<unknown> {
    return this.declareInput($.input).pipe(
        take(1),
        tap(el => {
          el.value = newValue;
        }),
    );
  }

  private setupHandleInput(): Observable<unknown> {
    return this.declareInput($.input._.onInput)
        .pipe(
            debounceTime(DEBOUNCE_MS),
            withLatestFrom(this.validator$, this.value$),
            tap(([value, validator, prevValue]) => {
              const isValid = !validator || !!validator(value);
              this.value$.next(isValid ? value : prevValue);
            }),
        );
  }

  @cache()
  private get validator$(): Observable<Function|null> {
    return this.declareInput($.host._.setValidator).pipe(
        map(([validator]) => {
          return instanceofType(Function).check(validator) ? validator : null;
        }),
        startWith(null),
    );
  }
}
