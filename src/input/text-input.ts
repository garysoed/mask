import { BooleanType, InstanceofType, StringType } from 'gs-types/export';
import { attributeIn, dispatcher, DispatchFn, element, onInput, subject } from 'persona/export/input';
import { attributeOut } from 'persona/export/output';
import { combineLatest, merge, Observable } from 'rxjs';
import { startWith, take, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ChangeEvent } from '../event/change-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
import textInputTemplate from './text-input.html';

const DEBOUNCE_MS = 250;

export const $ = {
  host: element({
    clearObs: subject<void>('mkClear'),
    disabled: attributeIn('disabled', booleanParser(), BooleanType, false),
    dispatch: dispatcher(),
    initValue: attributeIn('init-value', stringParser(), StringType, ''),
  }),
  input: element('input', InstanceofType(HTMLInputElement), {
    disabled: attributeOut('disabled', booleanParser(), value => !value),
    // TODO: This should cause compile error if the Element type is not InputElement.
    onInput: onInput(DEBOUNCE_MS),
  }),
};

@_p.customElement({
  input: [
    $.host._.clearObs,
    $.host._.disabled,
    $.host._.dispatch,
    $.host._.initValue,
    $.input,
    $.input._.onInput,
  ],
  tag: 'mk-text-input',
  template: textInputTemplate,
})
@_p.render($.input._.disabled).withForwarding($.host._.disabled.id)
class TextInput extends ThemedCustomElementCtrl {
  @_p.onCreate()
  dispatchChangeEvent_(
      @_v.vineIn($.host._.dispatch.id) dispatchObs: Observable<DispatchFn<ChangeEvent>>,
      @_v.vineIn($.input._.onInput.id) onInputObs: Observable<string>,
  ): Observable<unknown> {
    return onInputObs
        .pipe(
            withLatestFrom(dispatchObs),
            tap(([inputValue, dispatch]) => {
              dispatch(new ChangeEvent(inputValue));
            }),
        );
  }

  @_p.onCreate()
  setInitValue_(
      @_v.vineIn($.host._.clearObs.id) clearObs: Observable<void>,
      @_v.vineIn($.host._.initValue.id) initValueObs: Observable<string>,
      @_v.vineIn($.input.id) inputElObs: Observable<HTMLInputElement>,
  ): Observable<unknown> {
    // Set the initial value when:
    // 1.  init-value attribute is first set.
    // 2.  clear is called
    return merge(
            clearObs.pipe(startWith()),
            initValueObs.pipe(take(1)),
        )
        .pipe(
            withLatestFrom(initValueObs, inputElObs),
            tap(([, initValue, inputEl]) => {
              inputEl.value = initValue;
            }),
        );
  }
}

export function textInput(): Config {
  return {tag: 'mk-text-input'};
}
