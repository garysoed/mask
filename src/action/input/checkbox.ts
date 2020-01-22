import { Vine } from '@grapevine';
import { stringMatchConverter } from '@gs-tools/serializer';
import { InstanceofType } from '@gs-types';
import { compose, Converter, firstSuccess, Result } from '@nabu';
import { attributeIn, attributeOut, classToggle, element, InitFn, onDom } from '@persona';
import { combineLatest, merge, Observable } from '@rxjs';
import { filter, map, mapTo, startWith, tap, withLatestFrom } from '@rxjs/operators';

import { _p } from '../../app/app';
import checkboxChecked from '../../asset/checkbox_checked.svg';
import checkboxEmpty from '../../asset/checkbox_empty.svg';
import checkboxUnknown from '../../asset/checkbox_unknown.svg';
import { $$ as $iconWithText, IconWithText } from '../../display/icon-with-text';
import { $svgConfig } from '../../display/svg-service';
import { booleanParser } from '../../util/parsers';

import { $$ as $baseInput, BaseInput } from './base-input';
import template from './checkbox.html';


export type CheckedValue = boolean | 'unknown';

const checkedValueParser = firstSuccess<CheckedValue, string>(
    booleanParser(),
    stringMatchConverter<'unknown'>(['unknown']),
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
  host: element({
    ...$$.api,
    onBlur: onDom('blur'),
    onFocus: onDom('focus'),
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
  }),
  root: element('root', InstanceofType(HTMLDivElement), {
    onClick: onDom('click'),
  }),
  text: element('text', $iconWithText, {
    disabledClass: classToggle('disabled'),
    iconIn: attributeIn($iconWithText.api.icon.attrName, iconCheckedValueParser, false),
    iconOut: attributeOut($iconWithText.api.icon.attrName, iconCheckedValueParser),
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
  private readonly onBlurObs = this.declareInput($.host._.onBlur);
  private readonly onClickObs = this.declareInput($.root._.onClick);
  private readonly onFocusObs = this.declareInput($.host._.onFocus);
  private readonly onMouseEnterObs = this.declareInput($.host._.onMouseEnter);
  private readonly onMouseLeaveObs = this.declareInput($.host._.onMouseLeave);
  private readonly textIconIn$ = this.declareInput($.text._.iconIn);

  constructor(shadowRoot: ShadowRoot) {
    super(
        $.host._.initValue,
        $.host._.value,
        $.text._.label,
        $.text._.disabledClass,
        shadowRoot,
    );
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupOnClickHandler(),
      this.renderStream($.text._.mode, this.renderIconMode),
    ];
  }

  protected getCurrentValueObs(): Observable<CheckedValue> {
    return this.textIconIn$;
  }

  protected setupUpdateValue(value$: Observable<CheckedValue>): Observable<unknown> {
    return $.text._.iconOut.output(this.shadowRoot, value$);
  }

  private renderIconMode(): Observable<string> {
    const hoverObs = merge(
        this.onMouseEnterObs.pipe(mapTo(true)),
        this.onMouseLeaveObs.pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    const focusedObs = merge(
        this.onFocusObs.pipe(mapTo(true)),
        this.onBlurObs.pipe(mapTo(false)),
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
    return this.onClickObs
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
