import { instanceStreamId } from 'grapevine/export/component';
import { AnyType, BooleanType, InstanceofType, StringType } from 'gs-types/export';
import { attributeIn, element, onInput, subject } from 'persona/export/input';
import { attributeOut } from 'persona/export/output';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, startWith, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
import textInputTemplate from './text-input.html';

const DEBOUNCE_MS = 250;

export const $ = {
  host: element({
    clearObs: subject<void>('mkClear', AnyType()),
    disabled: attributeIn('disabled', booleanParser(), BooleanType, false),
    initValue: attributeIn('init-value', stringParser(), StringType, ''),
    value: attributeOut('value', stringParser()),
  }),
  input: element('input', InstanceofType(HTMLInputElement), {
    disabled: attributeOut('disabled', booleanParser(), value => !value),
    // TODO: This should cause compile error if the Element type is not InputElement.
    onInput: onInput(DEBOUNCE_MS),
  }),
};

const $isDirty = instanceStreamId('isDirty', BooleanType);

// Emits the init value whenever the input's value needs to be set to it.
const $shouldSetInitValue = instanceStreamId('initValue', StringType);

@_p.customElement({
  input: [
    $.host._.clearObs,
    $.host._.disabled,
    $.host._.initValue,
    $.input,
    $.input._.onInput,
  ],
  tag: 'mk-text-input',
  template: textInputTemplate,
})
@_p.render($.input._.disabled).withForwarding($.host._.disabled.id)
@_p.render($.host._.value).withForwarding($.input._.onInput.id)
export class TextInput extends ThemedCustomElementCtrl {
  // @_v.vineOut($shouldSetInitValue)
  // providesInitValue_(
  //     @_v.vineIn($.host._.clearObs.id) clearObs: Observable<void>,
  //     @_v.vineIn($isDirty) isDirtyObs: Observable<boolean>,
  //     @_v.vineIn($.host._.initValue.id) initValueObs: Observable<string>,
  // ): Observable<string> {
  //   // Set the initial value when:
  //   // 1.  clear is called
  //   // 2.  Whenever init value is changed, but user has not interacted with the input element.
  //   return merge(
  //       clearObs,
  //       initValueObs.pipe(
  //           withLatestFrom(isDirtyObs),
  //           filter(([, isDirty]) => !isDirty),
  //       ),
  //   )
  //   .pipe(
  //       startWith(),
  //       withLatestFrom(initValueObs),
  //       map(([, initValue]) => initValue),
  //   );
  // }

  // @_v.vineOut($isDirty)
  // providesIsDirty_(
  //     @_v.vineIn($.input._.onInput.id) onInputObs: Observable<string>,
  //     @_v.vineIn($.host._.clearObs.id) clearObs: Observable<void>,
  // ): Observable<boolean> {
  //   return merge(
  //       onInputObs.pipe(mapTo(true)),
  //       clearObs.pipe(mapTo(false)),
  //   )
  //   .pipe(startWith(false));
  // }

  @_p.render($.host._.value)
  renderHostValue_(
      @_v.vineIn($shouldSetInitValue) shouldSetInitValueObs: Observable<string>,
      @_v.vineIn($.input._.onInput.id) onInputObs: Observable<string>,
      @_v.vineIn($.input.id) inputElObs: Observable<HTMLInputElement>,
  ): Observable<string> {
    return inputElObs
        .pipe(
            switchMap(el => {
              return merge(shouldSetInitValueObs, onInputObs)
                  .pipe(startWith(el.value));
            }),
        );
  }

  @_p.onCreate()
  updateInputEl_(
      @_v.vineIn($shouldSetInitValue) shouldSetInitValueObs: Observable<string>,
      @_v.vineIn($.input.id) inputElObs: Observable<HTMLInputElement>,
  ): Observable<unknown> {
    return shouldSetInitValueObs
        .pipe(
            withLatestFrom(inputElObs),
            tap(([initValue, inputEl]) => {
              inputEl.value = initValue;
            }),
        );
  }
}

export function textInput(): Config {
  return {tag: 'mk-text-input'};
}
