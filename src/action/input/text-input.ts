import { Logger } from 'santa';
import { Observable, defer, merge, of as observableOf } from 'rxjs';
import { PersonaContext, attributeIn, attributeOut, dispatcher, element, enumParser, host, onInput, setAttribute, stringParser } from 'persona';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { map, startWith } from 'rxjs/operators';

import { CHANGE_EVENT } from '../../event/change-event';
import { _p } from '../../app/app';
import { stateIdParser } from '../../core/state-id-parser';

import { $baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME } from './base-input';
import template from './text-input.html';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = new Logger('mask.TextInput');


enum InputType {
  EMAIL = 'email',
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

export const $textInput = {
  api: {
    ...$baseInput.api,
    autocomplete: attributeIn('autocomplete', enumParser(AutocompleteType), 'off'),
    onChange: dispatcher(CHANGE_EVENT),
    stateId: attributeIn(STATE_ID_ATTR_NAME, stateIdParser<string>()),
    type: attributeIn('type', enumParser(InputType), InputType.TEXT),
  },
  tag: 'mk-text-input',
};

export const $ = {
  host: host($textInput.api),
  input: element('input', instanceofType(HTMLInputElement), {
    autocomplete: attributeOut('autocomplete', stringParser()),
    disabled: setAttribute('disabled'),
    // TODO: This should cause compile error if the Element type is not InputElement.
    onInput: onInput(),
    type: attributeOut('type', enumParser(InputType)),
  }),
};

@_p.customElement({
  ...$textInput,
  template,
})
export class TextInput extends BaseInput<string> {
  constructor(context: PersonaContext) {
    super(
        '',
        $.input._.disabled,
        $.host._.stateId,
        $.host._.onChange,
        context,
    );

    this.render($.input._.type, this.declareInput($.host._.type));
    this.render($.input._.autocomplete, this.declareInput($.host._.autocomplete));
  }

  @cache()
  protected get domValue$(): Observable<string> {
    const el = $.input.getSelectable(this.context);
    return merge(this.declareInput($.input._.onInput), this.onDomValueUpdatedByScript$)
        .pipe(
            startWith({}),
            map(() => el.value),
        );
  }

  protected updateDomValue(newValue: string): Observable<unknown> {
    return defer(() => {
      const el = $.input.getSelectable(this.context);
      el.value = newValue;

      return observableOf({});
    });
  }
}
