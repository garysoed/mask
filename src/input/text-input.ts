// import { instanceStreamId, staticSourceId } from '@grapevine/component';
// import { AnyType, BooleanType, InstanceofType, NumberType, StringType } from '@gs-types';
// import { attributeIn, element, handler, onInput } from '@persona/input';
// import { attributeOut } from '@persona/output';
// import { merge, Observable } from 'rxjs';
// import { debounce, filter, map, mapTo, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
// import { _p, _v } from '../app/app';
// import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
// import { booleanParser, stringParser } from '../util/parsers';
// import textInputTemplate from './text-input.html';

// export const $$ = {
//   clearFn: handler<[]>('clear'),
//   disabled: attributeIn('disabled', booleanParser(), false),
//   initValue: attributeIn('init-value', stringParser(), ''),
//   value: attributeOut('value', stringParser()),
// };

// export const $ = {
//   host: element($$),
//   input: element('input', InstanceofType(HTMLInputElement), {
//     disabled: attributeOut('disabled', booleanParser(), false),
//     // TODO: This should cause compile error if the Element type is not InputElement.
//     onInput: onInput(),
//   }),
// };

// const DEBOUNCE_MS = 250;
// export const $debounceMs = staticSourceId('debounceMs', NumberType);
// _v.builder.source($debounceMs, DEBOUNCE_MS);

// const $isDirty = instanceStreamId('isDirty', BooleanType);

// // Emits the init value whenever the input's value needs to be set to it.
// const $shouldSetInitValue = instanceStreamId('initValue', StringType);

// @_p.customElement({
//   tag: 'mk-text-input',
//   template: textInputTemplate,
// })
// @_p.render($.input._.disabled).withForwarding($.host._.disabled)
// @_p.render($.host._.value).withForwarding($.input._.onInput)
// export class TextInput extends ThemedCustomElementCtrl {
//   @_v.vineOut($shouldSetInitValue)
//   providesInitValue_(
//       @_p.input($.host._.clearFn) clearObs: Observable<[]>,
//       @_v.vineIn($isDirty) isDirtyObs: Observable<boolean>,
//       @_p.input($.host._.initValue) initValueObs: Observable<string>,
//   ): Observable<string> {
//     // Set the initial value when:
//     // 1.  clear is called
//     // 2.  Whenever init value is changed, but user has not interacted with the input element.
//     return merge(
//         clearObs,
//         initValueObs.pipe(
//             withLatestFrom(isDirtyObs),
//             filter(([, isDirty]) => !isDirty),
//         ),
//     )
//     .pipe(
//         startWith(),
//         withLatestFrom(initValueObs),
//         map(([, initValue]) => initValue),
//     );
//   }

//   @_v.vineOut($isDirty)
//   providesIsDirty_(
//       @_p.input($.input._.onInput) onInputObs: Observable<string>,
//       @_p.input($.host._.clearFn) clearObs: Observable<[]>,
//   ): Observable<boolean> {
//     return merge(
//         onInputObs.pipe(mapTo(true)),
//         clearObs.pipe(mapTo(false)),
//     )
//     .pipe(startWith(false));
//   }

//   @_p.render($.host._.value)
//   renderHostValue_(
//       @_v.vineIn($debounceMs) debounceMsObs: Observable<number>,
//       @_v.vineIn($shouldSetInitValue) shouldSetInitValueObs: Observable<string>,
//       @_p.input($.input._.onInput) onInputObs: Observable<string>,
//       @_p.input($.input) inputElObs: Observable<HTMLInputElement>,
//   ): Observable<string> {
//     return inputElObs
//         .pipe(
//             debounce(() => debounceMsObs),
//             switchMap(el => merge(shouldSetInitValueObs, onInputObs)
//                 .pipe(startWith(el.value)),
//             ),
//         );
//   }

//   @_p.onCreate()
//   updateInputEl_(
//       @_v.vineIn($shouldSetInitValue) shouldSetInitValueObs: Observable<string>,
//       @_p.input($.input) inputElObs: Observable<HTMLInputElement>,
//   ): Observable<unknown> {
//     return shouldSetInitValueObs
//         .pipe(
//             withLatestFrom(inputElObs),
//             tap(([initValue, inputEl]) => {
//               inputEl.value = initValue;
//             }),
//         );
//   }
// }
