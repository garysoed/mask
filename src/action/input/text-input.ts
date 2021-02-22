import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {attributeIn, attributeOut, dispatcher, element, enumParser, host, onInput, PersonaContext, setAttribute, stringParser} from 'persona';
import {defer, merge, Observable, of as observableOf} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {_p} from '../../app/app';
import {stateIdParser} from '../../core/state-id-parser';
import {CHANGE_EVENT} from '../../event/change-event';

import {$baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME} from './base-input';
import template from './text-input.html';


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
    onInput: onInput(),
    type: attributeOut('type', enumParser(InputType)),
  }),
};

@_p.customElement({
  ...$textInput,
  template,
})
export class TextInput extends BaseInput<string, typeof $> {
  constructor(context: PersonaContext) {
    super(
        '',
        $.input._.disabled,
        $.host._.stateId,
        $.host._.onChange,
        context,
        $,
    );
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.renders,
      this.renderers.input.type(this.inputs.host.type),
      this.renderers.input.autocomplete(this.inputs.host.autocomplete),
    ];
  }

  @cache()
  protected get domValue$(): Observable<string> {
    const el = $.input.getSelectable(this.context);
    return merge(this.inputs.input.onInput, this.onDomValueUpdatedByScript$)
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
