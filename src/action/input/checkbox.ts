import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {attributeIn, classlist, dispatcher, element, host, onInput, PersonaContext, setAttribute, stringParser, textOut} from 'persona';
import {defer, merge, Observable, of as observableOf} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {_p} from '../../app/app';
import checkboxChecked from '../../asset/checkbox_checked.svg';
import checkboxEmpty from '../../asset/checkbox_empty.svg';
import checkboxUnknown from '../../asset/checkbox_unknown.svg';
import {stateIdParser} from '../../core/state-id-parser';
import {registerSvg} from '../../core/svg-service';
import {ChangeEvent, CHANGE_EVENT} from '../../event/change-event';
import {$baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME} from '../input/base-input';

import template from './checkbox.html';


export type CheckedValue = boolean | 'unknown';

export const $checkbox = {
  api: {
    ...$baseInput.api,
    label: attributeIn('label', stringParser()),
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
  checkedLabel: element('checkedLabel', instanceofType(HTMLParagraphElement), {
    text: textOut(),
  }),
  container: element('container', instanceofType(HTMLLabelElement), {
    checkMode: classlist(),
  }),
  // TODO: Support selectors for multiple elements.
  host: host({
    ...$checkbox.api,
  }),
  uncheckedLabel: element('uncheckedLabel', instanceofType(HTMLParagraphElement), {
    text: textOut(),
  }),
  unknownLabel: element('unknownLabel', instanceofType(HTMLParagraphElement), {
    text: textOut(),
  }),
};

@_p.customElement({
  ...$checkbox,
  configure(vine: Vine): void {
    registerSvg(
        vine,
        'mk.checkbox_checked',
        {type: 'embed', content: checkboxChecked},
    );
    registerSvg(
        vine,
        'mk.checkbox_unchecked',
        {type: 'embed', content: checkboxEmpty},
    );
    registerSvg(
        vine,
        'mk.checkbox_unknown',
        {type: 'embed', content: checkboxUnknown},
    );
  },
  template,
})
export class Checkbox extends BaseInput<CheckedValue, typeof $> {
  constructor(context: PersonaContext) {
    super(
        false,
        $.checkbox._.disabled,
        $.host._.stateId,
        $.host._.onChange,
        context,
        $,
    );
  }

  @cache()
  get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.renders,
      this.renderers.container.checkMode(this.checkMode$),
      // TODO: Add default value.
      this.renderers.checkedLabel.text(this.label$),
      this.renderers.uncheckedLabel.text(this.label$),
      this.renderers.unknownLabel.text(this.label$),
    ];
  }

  @cache()
  private get checkMode$(): Observable<ReadonlySet<string>> {
    return this.domValue$.pipe(
        map(checkState => {
          if (checkState === 'unknown') {
            return 'unknown';
          }

          return checkState ? 'checked' : 'unchecked';
        }),
        map(checkState => new Set([`display_${checkState}`])),
    );
  }

  @cache()
  protected get domValue$(): Observable<CheckedValue> {
    return merge(
        this.inputs.checkbox.onInput,
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

  @cache()
  protected get label$(): Observable<string> {
    return this.inputs.host.label.pipe(
        map(label => label ?? ''),
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
