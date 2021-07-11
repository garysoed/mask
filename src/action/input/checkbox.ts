import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {MutableState} from 'gs-tools/export/state';
import {$input, $label, $p, attributeIn, classlist, dispatcher, element, host, onInput, PersonaContext, setAttribute, stringParser, textOut} from 'persona';
import {defer, merge, Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {_p} from '../../app/app';
import checkboxChecked from '../../asset/checkbox_checked.svg';
import checkboxEmpty from '../../asset/checkbox_empty.svg';
import checkboxUnknown from '../../asset/checkbox_unknown.svg';
import {objectPathParser} from '../../core/object-path-parser';
import {registerSvg} from '../../core/svg-service';
import {Icon} from '../../display/icon';
import {ChangeEvent, CHANGE_EVENT} from '../../event/change-event';
import {ListItemLayout} from '../../layout/list-item-layout';
import {$baseInput as $baseInput, BaseInput, OBJECT_PATH_ATTR_NAME} from '../input/base-input';

import template from './checkbox.html';


export type CheckedValue = boolean | 'unknown';

export const $checkbox = {
  api: {
    ...$baseInput.api,
    label: attributeIn('label', stringParser(), ''),
    onChange: dispatcher<ChangeEvent<CheckedValue>>(CHANGE_EVENT),
    stateId: attributeIn(OBJECT_PATH_ATTR_NAME, objectPathParser<MutableState<CheckedValue>>()),
  },
  tag: 'mk-checkbox',
};

export const $ = {
  checkbox: element('checkbox', $input, {
    onInput: onInput(),
    disabled: setAttribute('disabled'),
  }),
  checkedLabel: element('checkedLabel', $p, {
    text: textOut(),
  }),
  container: element('container', $label, {
    checkMode: classlist(),
  }),
  host: host({
    ...$checkbox.api,
  }),
  uncheckedLabel: element('uncheckedLabel', $p, {
    text: textOut(),
  }),
  unknownLabel: element('unknownLabel', $p, {
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
  dependencies: [
    Icon,
    ListItemLayout,
  ],
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
        $.host._,
    );
  }

  @cache()
  get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.renders,
      this.renderers.container.checkMode(this.checkMode$),
      this.renderers.checkedLabel.text(this.inputs.host.label),
      this.renderers.uncheckedLabel.text(this.inputs.host.label),
      this.renderers.unknownLabel.text(this.inputs.host.label),
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

      return of({});
    });
  }
}
