import { Observable, defer, merge, of as observableOf } from 'rxjs';
import { PersonaContext, attributeIn, attributeOut, dispatcher, element, host, onInput, setAttribute, stringParser } from 'persona';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { map, startWith } from 'rxjs/operators';

import { $baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME } from '../input/base-input';
import { CHANGE_EVENT, ChangeEvent } from '../../event/change-event';
import { _p } from '../../app/app';
import { stateIdParser } from '../../core/state-id-parser';

import template from './checkbox.html';


export type CheckedValue = boolean | 'unknown';

export const $checkbox = {
  api: {
    ...$baseInput.api,
    onChange: dispatcher<ChangeEvent<CheckedValue>>(CHANGE_EVENT),
    stateId: attributeIn(STATE_ID_ATTR_NAME, stateIdParser<CheckedValue>()),
  },
  tag: 'mk-checkbox',
};

export const $ = {
  checkbox: element('checkbox', instanceofType(HTMLInputElement), {
    onInput: onInput(),
    disabled: setAttribute('disabled'),
  }),
  display: element('display', instanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
  host: host({
    ...$checkbox.api,
  }),
};

@_p.customElement({
  ...$checkbox,
  template,
})
export class Checkbox extends BaseInput<CheckedValue> {
  constructor(context: PersonaContext) {
    super(
        false,
        $.checkbox._.disabled,
        $.host._.stateId,
        $.host._.onChange,
        context,
    );

    this.render($.display._.name, this.displaySlot$);
  }

  @cache()
  private get displaySlot$(): Observable<string> {
    return this.domValue$.pipe(
        map(checkState => {
          if (checkState === 'unknown') {
            return 'unknown';
          }

          return checkState ? 'checked' : 'unchecked';
        }),
        map(checkState => `display_${checkState}`),
    );
  }

  @cache()
  protected get domValue$(): Observable<CheckedValue> {
    return merge(
        this.declareInput($.checkbox._.onInput),
        this.onDomValueUpdatedByScript$,
    )
        .pipe(
            startWith({}),
            map(() => {
              const element = $.checkbox.getSelectable(this.context);
              if (element.indeterminate) {
                return 'unknown';
              }

              return element.checked;
            }),
        );
  }

  protected updateDomValue(newValue: CheckedValue): Observable<unknown> {
    return defer(() => {
      const el = $.checkbox.getSelectable(this.context);
      if (newValue === 'unknown') {
        el.indeterminate = true;
        el.checked = false;
      } else {
        el.indeterminate = false;
        el.checked = newValue;
      }

      return observableOf({});
    });
  }
}
