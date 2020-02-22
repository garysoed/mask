import { Vine } from 'grapevine';
import { filterByType } from 'gs-tools/export/rxjs';
import { stringMatchConverter } from 'gs-tools/export/serializer';
import { booleanType, elementWithTagType, instanceofType } from 'gs-types';
import { compose, Converter, firstSuccess, Result } from 'nabu';
import { attributeIn, attributeOut, element, InitFn, mapOutput, onDom, SimpleElementRenderSpec, single, splitOutput } from 'persona';
import { combineLatest, merge, Observable } from 'rxjs';
import { filter, map, mapTo, startWith, tap, withLatestFrom } from 'rxjs/operators';

import { _p } from '../../app/app';
import checkboxChecked from '../../asset/checkbox_checked.svg';
import checkboxEmpty from '../../asset/checkbox_empty.svg';
import checkboxUnknown from '../../asset/checkbox_unknown.svg';
import { $$ as $icon } from '../../display/icon';
import { IconWithText } from '../../display/icon-with-text';
import { $svgConfig } from '../../display/svg-service';
import { booleanParser } from '../../util/parsers';

import { $$ as $baseInput, BaseInput } from './base-input';
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
    ...$baseInput,
    initValue: attributeIn('init-value', checkedValueParser, false),
    value: attributeOut('value', checkedValueParser, false),
  },
  tag: 'mk-checkbox',
};

export const $ = {
  checkbox: element('checkbox', instanceofType(HTMLInputElement), {
    checkedIn: attributeIn('checked', stringMatchConverter(['checked', ''])),
    checkedOut: attributeOut('checked', stringMatchConverter(['checked', '']), ''),
    onClick: onDom('click'),
    readonly: attributeOut('readonly', booleanParser(), false),
  }),
  checkmark: element('checkmark', $icon, {
    iconOut: attributeOut($icon.api.icon.attrName, iconCheckedValueParser),
  }),
  container: element('container', elementWithTagType('label'), {
    label: single('label'),
  }),
  host: element({
    ...$$.api,
    onBlur: onDom('blur'),
    onFocus: onDom('focus'),
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
  }),
};

@_p.customElement({
  configure(vine: Vine): void {
    const svgConfigSbj = $svgConfig.get(vine);
    svgConfigSbj.next({
      key: 'checkbox_checked',
      type: 'set',
      value: {type: 'embed', content: checkboxChecked}},
    );
    svgConfigSbj.next({
      key: 'checkbox_unchecked',
      type: 'set',
      value: {type: 'embed', content: checkboxEmpty}},
    );
    svgConfigSbj.next({
      key: 'checkbox_unknown',
      type: 'set',
      value: {type: 'embed', content: checkboxUnknown}},
    );
  },
  dependencies: [
    IconWithText,
  ],
  tag: 'mk-checkbox',
  template,
})
export class Checkbox extends BaseInput<CheckedValue> {
  private readonly onBlur$ = this.declareInput($.host._.onBlur);
  private readonly onCheckboxClick$ = this.declareInput($.checkbox._.onClick);
  private readonly onFocus$ = this.declareInput($.host._.onFocus);
  private readonly onMouseEnter$ = this.declareInput($.host._.onMouseEnter);
  private readonly onMouseLeave$ = this.declareInput($.host._.onMouseLeave);

  constructor(shadowRoot: ShadowRoot) {
    super(
        $.host._.initValue,
        splitOutput([
          $.host._.value,
          $.checkmark._.iconOut,
        ]),
        mapOutput(
            $.container._.label,
            value => new SimpleElementRenderSpec('span', undefined, value),
        ),
        $.checkbox._.readonly,
        shadowRoot,
    );
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupOnClickHandler(),
      this.renderStream($.checkmark._.mode, this.renderIconMode),
    ];
  }

  protected getCurrentValueObs(): Observable<CheckedValue> {
    const indeterminate$ = $.checkbox.getValue(this.shadowRoot).pipe(
        map(element => element.indeterminate),
    );

    const checked$ = $.checkbox._.checkedIn.getValue(this.shadowRoot);
    return combineLatest([indeterminate$, checked$]).pipe(
        map(([indeterminate, checked]) => {
          if (indeterminate) {
            return 'unknown';
          }

          return checked === 'checked';
        }),
    );
  }

  protected setupUpdateValue(value$: Observable<CheckedValue>): Observable<unknown> {
    const indeterminate$ = value$.pipe(
        filter(value => value === 'unknown'),
        withLatestFrom($.checkbox.getValue(this.shadowRoot)),
        tap(([, element]) => {
          element.indeterminate = true;
        }),
    );

    const trueFalse$ = value$.pipe(
        filterByType(booleanType),
        withLatestFrom($.checkbox.getValue(this.shadowRoot)),
        tap(([, element]) => {
          element.indeterminate = false;
        }),
        map(([value]) => value ? 'checked' : ''),
    );

    return merge(indeterminate$, $.checkbox._.checkedOut.output(this.shadowRoot, trueFalse$));
  }

  private renderIconMode(): Observable<string> {
    const hoverObs = merge(
        this.onMouseEnter$.pipe(mapTo(true)),
        this.onMouseLeave$.pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    const focusedObs = merge(
        this.onFocus$.pipe(mapTo(true)),
        this.onBlur$.pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    return combineLatest([
      this.disabled$,
      focusedObs,
      hoverObs,
    ])
    .pipe(
        map(([disabled, focused, hover]) => {
          if (disabled) {
            return 'disabled';
          }

          if (hover || focused) {
            return 'focus';
          }

          return 'action';
        }),
    );
  }

  private setupOnClickHandler(): Observable<unknown> {
    return this.onCheckboxClick$
        .pipe(
            withLatestFrom(this.disabled$, this.value$),
            filter(([, disabled]) => !disabled),
            map(([, , currentValue]) => {
              switch (currentValue) {
                case 'unknown':
                case false:
                  return true;
                case true:
                  return false;
              }
            }),
            tap(newValue => this.dirtyValue$.next(newValue)),
    );
  }
}
