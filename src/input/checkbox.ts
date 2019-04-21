import { Vine } from '@grapevine';
import { $pipe, $push, asImmutableMap } from '@gs-tools/collect';
import { stringMatchConverter } from '@gs-tools/serializer';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { Converter, Result } from '@nabu/main';
import { compose, firstSuccess } from '@nabu/util';
import { InitFn } from '@persona';
import { attributeIn, element, handler, onDom } from '@persona/input';
import { api } from '@persona/main';
import { attributeOut } from '@persona/output';
import { combineLatest, merge, Observable } from 'rxjs';
import { filter, map, mapTo, startWith, take, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import * as checkboxChecked from '../asset/checkbox_checked.svg';
import * as checkboxEmpty from '../asset/checkbox_empty.svg';
import * as checkboxUnknown from '../asset/checkbox_unknown.svg';
import { $$ as $iconWithText, IconWithText } from '../display/icon-with-text';
import { SvgConfig } from '../display/svg-config';
import { $svgConfig } from '../display/svg-service';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
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
  clearFn: handler<[]>('clear'),
  disabled: attributeIn('disabled', booleanParser(), false),
  initValue: attributeIn('init-value', checkedValueParser, false),
  label: attributeIn('label', stringParser(), ''),
  value: attributeOut('value', checkedValueParser, false),
};

export const $ = {
  host: element({
    ...$$,
    onBlur: onDom('blur'),
    onFocus: onDom('focus'),
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
  }),
  root: element('root', InstanceofType(HTMLDivElement), {
    onClick: onDom('click'),
  }),
  text: element('text', ElementWithTagType('mk-icon-with-text'), {
    ...api($iconWithText),
    iconIn: attributeIn($iconWithText.icon.attrName, iconCheckedValueParser, false),
    iconOut: attributeOut($iconWithText.icon.attrName, iconCheckedValueParser),
  }),
};

@_p.customElement({
  configure(vine: Vine): void {
    const svgConfigSbj = $svgConfig.get(vine);
    svgConfigSbj
        .pipe(take(1))
        .subscribe(svgConfig => {
          const newConfig = $pipe(
              svgConfig,
              $push<[string, SvgConfig], string>(
                  ['checkbox_checked', {type: 'embed', content: checkboxChecked}],
                  ['checkbox_unchecked', {type: 'embed', content: checkboxEmpty}],
                  ['checkbox_unknown', {type: 'embed', content: checkboxUnknown}],
              ),
              asImmutableMap(),
          );

          svgConfigSbj.next(newConfig);
        });
  },
  dependencies: [
    IconWithText,
  ],
  tag: 'mk-checkbox',
  template,
})
export class Checkbox extends ThemedCustomElementCtrl {
  private readonly clearObs = _p.input($.host._.clearFn, this);
  private readonly disabledObs = _p.input($.host._.disabled, this);
  private readonly iconObs = _p.input($.text._.iconIn, this);
  private readonly initValueObs = _p.input($.host._.initValue, this);
  private readonly isDirtyObs = _v.stream(this.providesIsDirty, this).asObservable();
  private readonly labelObs = _p.input($.host._.label, this);
  private readonly onBlurObs = _p.input($.host._.onBlur, this);
  private readonly onClickObs = _p.input($.root._.onClick, this);
  private readonly onFocusObs = _p.input($.host._.onFocus, this);
  private readonly onMouseEnterObs = _p.input($.host._.onMouseEnter, this);
  private readonly onMouseLeaveObs = _p.input($.host._.onMouseLeave, this);
  private readonly shouldSetInitValueObs = _v.stream(this.providesInitValue, this).asObservable();
  private readonly textIconIn = _p.input($.text._.iconIn, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.host._.value).withObservable(this.textIconIn),
      _p.render($.text._.iconOut).withVine(_v.stream(this.renderIcon, this)),
      _p.render($.text._.label).withObservable(this.labelObs),
      _p.render($.text._.mode).withVine(_v.stream(this.renderIconMode, this)),
    ];
  }

  private providesInitValue(): Observable<CheckedValue> {
    // Set the initial value when:
    // 1.  clear is called
    // 2.  Whenever init value is changed, but is not dirty.
    return merge(
        this.clearObs,
        this.initValueObs.pipe(
            withLatestFrom(this.isDirtyObs),
            filter(([, isDirty]) => !isDirty),
        ),
    )
    .pipe(
        startWith(),
        withLatestFrom(this.initValueObs),
        map(([, initValue]) => initValue),
    );
  }

  private providesIsDirty(): Observable<boolean> {
    return merge(
        this.onClickObs.pipe(mapTo(true)),
        this.clearObs.pipe(mapTo(false)),
    )
    .pipe(startWith(false));
  }

  private renderIcon(): Observable<CheckedValue> {
    return this.onClickObs
        .pipe(
            withLatestFrom(this.iconObs),
            map(([, currentValue]) => {
              switch (currentValue) {
                case 'unknown':
                case true:
                  return false;
                case false:
                  return true;
              }
            }),
            startWith(false),
        );
  }

  renderIconMode(): Observable<string> {
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

    return combineLatest(
        this.disabledObs,
        focusedObs,
        hoverObs,
    )
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
}
