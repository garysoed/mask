import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {attributeIn, attributeOut, dispatcher, element, host, integerParser, onInput, PersonaContext, setAttribute} from 'persona';
import {defer, merge, Observable, of as observableOf} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Logger} from 'santa';

import {_p} from '../../app/app';
import {stateIdParser} from '../../core/state-id-parser';
import {CHANGE_EVENT} from '../../event/change-event';

import {$baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME} from './base-input';
import template from './number-input.html';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = new Logger('mask.NumberInput');


export const $numberInput = {
  api: {
    ...$baseInput.api,
    max: attributeIn('max', integerParser()),
    min: attributeIn('min', integerParser()),
    onChange: dispatcher(CHANGE_EVENT),
    stateId: attributeIn(STATE_ID_ATTR_NAME, stateIdParser<number>()),
    step: attributeIn('step', integerParser()),
  },
  tag: 'mk-number-input',
};

export const $ = {
  host: host($numberInput.api),
  input: element('input', instanceofType(HTMLInputElement), {
    disabled: setAttribute('disabled'),
    max: attributeOut('max', integerParser()),
    min: attributeOut('min', integerParser()),
    onInput: onInput(),
    step: attributeOut('step', integerParser()),
  }),
};

@_p.customElement({
  ...$numberInput,
  template,
})
export class NumberInput extends BaseInput<number, typeof $> {
  constructor(context: PersonaContext) {
    super(
        0,
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
      this.renderers.input.max(this.inputs.host.max),
      this.renderers.input.min(this.inputs.host.min),
      this.renderers.input.step(this.inputs.host.step),
    ];
  }

  @cache()
  protected get domValue$(): Observable<number> {
    const el = $.input.getSelectable(this.context);
    return merge(this.inputs.input.onInput, this.onDomValueUpdatedByScript$)
        .pipe(
            startWith({}),
            map(() => Number.parseInt(el.value, 10)),
        );
  }

  protected updateDomValue(newValue: number): Observable<unknown> {
    return defer(() => {
      const el = $.input.getSelectable(this.context);
      el.value = `${newValue}`;

      return observableOf({});
    });
  }
}
