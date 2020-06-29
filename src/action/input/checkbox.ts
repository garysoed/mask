import { Vine } from 'grapevine';
import { stringMatchConverter } from 'gs-tools/export/serializer';
import { elementWithTagType, instanceofType } from 'gs-types';
import { compose, Converter, firstSuccess, Result } from 'nabu';
import { attributeIn, attributeOut, booleanParser, classToggle, element, emitter, host, onDom, onInput, PersonaContext, single, textContent } from 'persona';
import { combineLatest, merge, Observable } from 'rxjs';
import { map, mapTo, startWith, take, tap, withLatestFrom } from 'rxjs/operators';

import { _p } from '../../app/app';
import checkboxChecked from '../../asset/checkbox_checked.svg';
import checkboxEmpty from '../../asset/checkbox_empty.svg';
import checkboxUnknown from '../../asset/checkbox_unknown.svg';
import { $$ as $icon } from '../../display/icon';
import { IconMode } from '../../display/icon-mode';
import { IconWithText } from '../../display/icon-with-text';
import { registerSvg } from '../../display/svg-service';

import { $$ as $baseInput, BaseInput, DEFAULT_VALUE_ATTR_NAME, Value, VALUE_PROPERTY_NAME } from './base-input';
import template from './checkbox.html';


export type CheckedValue = boolean | 'unknown';

const checkedValueParser = firstSuccess<CheckedValue, string>(
    stringMatchConverter<'unknown'>(['unknown']),
    booleanParser(),
);

type CheckedIcons = 'checkbox_unchecked' | 'checkbox_checked' | 'checkbox_unknown';

class CheckedIconsParser implements Converter<CheckedValue, CheckedIcons> {
  convertBackward(value: CheckedIcons): Result<CheckedValue> {
    switch (value) {
      case 'checkbox_unchecked':
        return {result: false, success: true};
      case 'checkbox_checked':
        return {result: true, success: true};
      case 'checkbox_unknown':
        return {result: 'unknown', success: true};
    }
  }

  convertForward(input: CheckedValue): Result<CheckedIcons> {
    switch (input) {
      case true:
        return {result: 'checkbox_checked', success: true};
      case false:
        return {result: 'checkbox_unchecked', success: true};
      case 'unknown':
        return {result: 'checkbox_unknown', success: true};
    }
  }
}

const iconCheckedValueParser = compose(
    new CheckedIconsParser(),
    stringMatchConverter(['checkbox_checked', 'checkbox_unchecked', 'checkbox_unknown']),
);

export const $$ = {
  api: {
    ...$baseInput.api,
    defaultValue: attributeIn(DEFAULT_VALUE_ATTR_NAME, checkedValueParser, 'unknown'),
    value: emitter<Value<CheckedValue>>(VALUE_PROPERTY_NAME),
  },
  tag: 'mk-checkbox',
};

export const $ = {
  checkbox: element('checkbox', instanceofType(HTMLInputElement), {
    onInput: onInput(),
    readonly: attributeOut('readonly', booleanParser(), false),
  }),
  checkmark: element('checkmark', $icon, {
    icon: attributeOut($icon.api.icon.attrName, iconCheckedValueParser),
  }),
  container: element('container', elementWithTagType('label'), {
    hasText: classToggle('hasText'),
    label: single('label'),
  }),
  host: host({
    ...$$.api,
    onBlur: onDom('blur'),
    onFocus: onDom('focus'),
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
  }),
  label: element('label', instanceofType(HTMLSpanElement), {
    text: textContent(),
  }),
};

@_p.customElement({
  ...$$,
  configure(vine: Vine): void {
    registerSvg(
        vine,
        'checkbox_checked',
        {type: 'embed', content: checkboxChecked},
    );
    registerSvg(
        vine,
        'checkbox_unchecked',
        {type: 'embed', content: checkboxEmpty},
    );
    registerSvg(
        vine,
        'checkbox_unknown',
        {type: 'embed', content: checkboxUnknown},
    );
  },
  dependencies: [
    IconWithText,
  ],
  template,
})
export class Checkbox extends BaseInput<CheckedValue> {
  constructor(context: PersonaContext) {
    super(
        $.host._.defaultValue,
        $.checkbox._.readonly,
        $.label._.text,
        $.host._.value,
        context,
    );

    this.addSetup(this.setupOnInput());
    this.render($.checkmark._.icon, this.value$.pipe(map(({value}) => value)));
    this.render($.checkmark._.mode, this.renderIconMode());
    this.render($.container._.hasText, this.renderHasText());
  }

  protected updateDomValue(newValue: CheckedValue): Observable<unknown> {
    return this.declareInput($.checkbox).pipe(
        take(1),
        tap(el => {
          if (newValue === 'unknown') {
            el.indeterminate = true;
            el.checked = false;
          } else {
            el.indeterminate = false;
            el.checked = newValue;
          }
        }),
    );
  }

  private renderHasText(): Observable<boolean> {
    return this.declareInput($.host._.label).pipe(map(label => !!label));
  }

  private renderIconMode(): Observable<IconMode> {
    const hovered$ = merge(
        this.declareInput($.host._.onMouseEnter).pipe(mapTo(true)),
        this.declareInput($.host._.onMouseLeave).pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    const focused$ = merge(
        this.declareInput($.host._.onFocus).pipe(mapTo(true)),
        this.declareInput($.host._.onBlur).pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    return combineLatest([
      this.disabled$,
      focused$,
      hovered$,
    ])
    .pipe(
        map(([disabled, focused, hover]) => {
          if (disabled) {
            return IconMode.DISABLED;
          }

          if (hover || focused) {
            return IconMode.FOCUS;
          }

          return IconMode.ACTION;
        }),
    );
  }

  private setupOnInput(): Observable<unknown> {
    return this.declareInput($.checkbox._.onInput)
        .pipe(
            withLatestFrom(this.declareInput($.checkbox)),
            map(([, element]) => {
              if (element.indeterminate) {
                return 'unknown';
              }

              return element.checked;
            }),
            tap(newValue => {
              this.onInputValue$.next(newValue);
            }),
        );
  }
}
