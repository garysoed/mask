// import { instanceStreamId } from '@grapevine/component';
// import { VineImpl } from '@grapevine/main';
// import { $pipe, $push, asImmutableMap } from '@gs-tools/collect';
// import { stringMatchConverter } from '@gs-tools/serializer';
// import { AnyType, BooleanType, ElementWithTagType, InstanceofType } from '@gs-types';
// import { Converter, Result } from '@nabu/main';
// import { compose, firstSuccess } from '@nabu/util';
// import { attributeIn, element, handler, onDom } from '@persona/input';
// import { api } from '@persona/main';
// import { attributeOut } from '@persona/output';
// import { combineLatest, merge, Observable } from 'rxjs';
// import { filter, map, mapTo, startWith, take, withLatestFrom } from 'rxjs/operators';
// import { _p, _v } from '../app/app';
// import * as checkboxChecked from '../asset/checkbox_checked.svg';
// import * as checkboxEmpty from '../asset/checkbox_empty.svg';
// import * as checkboxUnknown from '../asset/checkbox_unknown.svg';
// import { $$ as $iconWithText, IconWithText } from '../display/icon-with-text';
// import { SvgConfig } from '../display/svg-config';
// import { $svgConfig } from '../display/svg-service';
// import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
// import { booleanParser, stringParser } from '../util/parsers';
// import template from './checkbox.html';

// export type CheckedValue = boolean | 'unknown';

// const checkedValueParser = firstSuccess<CheckedValue, string>(
//     booleanParser(),
//     stringMatchConverter<'unknown'>(['unknown']),
// );

// type CheckedIcons = 'checkbox_unchecked' | 'checkbox_checked' | 'checkbox_unknown';

// class CheckedIconsParser implements Converter<CheckedValue, CheckedIcons> {
//   convertBackward(value: CheckedIcons): Result<CheckedValue> {
//     switch (value) {
//       case 'checkbox_unchecked':
//         return {result: false, success: true};
//       case 'checkbox_checked':
//         return {result: true, success: true};
//       case 'checkbox_unknown':
//         return {result: 'unknown', success: true};
//     }
//   }

//   convertForward(input: CheckedValue): Result<CheckedIcons> {
//     switch (input) {
//       case true:
//         return {result: 'checkbox_checked', success: true};
//       case false:
//         return {result: 'checkbox_unchecked', success: true};
//       case 'unknown':
//         return {result: 'checkbox_unknown', success: true};
//     }
//   }
// }

// const iconCheckedValueParser = compose(
//     new CheckedIconsParser(),
//     stringMatchConverter(['checkbox_checked', 'checkbox_unchecked', 'checkbox_unknown']),
// );

// export const $$ = {
//   clearFn: handler<[]>('clear'),
//   disabled: attributeIn('disabled', booleanParser(), false),
//   initValue: attributeIn('init-value', checkedValueParser, false),
//   label: attributeIn('label', stringParser(), ''),
//   value: attributeOut('value', checkedValueParser),
// };

// export const $ = {
//   host: element({
//     ...$$,
//     onBlur: onDom('blur'),
//     onFocus: onDom('focus'),
//     onMouseEnter: onDom('mouseenter'),
//     onMouseLeave: onDom('mouseleave'),
//   }),
//   root: element('root', InstanceofType(HTMLDivElement), {
//     onClick: onDom('click'),
//   }),
//   text: element('text', ElementWithTagType('mk-icon-with-text'), {
//     ...api($iconWithText),
//     iconIn: attributeIn($iconWithText.icon.attrName, iconCheckedValueParser, false),
//     iconOut: attributeOut($iconWithText.icon.attrName, iconCheckedValueParser),
//   }),
// };

// const $isDirty = instanceStreamId('isDirty', BooleanType);

// // Emits the init value whenever the input's value needs to be set to it.
// const $shouldSetInitValue = instanceStreamId('initValue', AnyType<CheckedValue>());

// @_p.customElement({
//   configure(vine: VineImpl): void {
//     vine.getObservable($svgConfig)
//         .pipe(take(1))
//         .subscribe(svgConfig => {
//           const newConfig = $pipe(
//               svgConfig,
//               $push<[string, SvgConfig], string>(
//                   ['checkbox_checked', {type: 'embed', content: checkboxChecked}],
//                   ['checkbox_unchecked', {type: 'embed', content: checkboxEmpty}],
//                   ['checkbox_unknown', {type: 'embed', content: checkboxUnknown}],
//               ),
//               asImmutableMap(),
//           );

//           vine.setValue($svgConfig, newConfig);
//         });
//   },
//   dependencies: [
//     IconWithText,
//   ],
//   tag: 'mk-checkbox',
//   template,
// })
// @_p.render($.host._.value).withForwarding($.text._.iconIn)
// @_p.render($.text._.label).withForwarding($.host._.label)
// export class Checkbox extends ThemedCustomElementCtrl {
//   @_v.vineOut($shouldSetInitValue)
//   providesInitValue_(
//       @_p.input($.host._.clearFn) clearObs: Observable<[]>,
//       @_v.vineIn($isDirty) isDirtyObs: Observable<boolean>,
//       @_p.input($.host._.initValue) initValueObs: Observable<CheckedValue>,
//   ): Observable<CheckedValue> {
//     // Set the initial value when:
//     // 1.  clear is called
//     // 2.  Whenever init value is changed, but is not dirty.
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
//       @_p.input($.root._.onClick) onClickObs: Observable<unknown>,
//       @_p.input($.host._.clearFn) clearObs: Observable<[]>,
//   ): Observable<boolean> {
//     return merge(
//         onClickObs.pipe(mapTo(true)),
//         clearObs.pipe(mapTo(false)),
//     )
//     .pipe(startWith(false));
//   }

//   @_p.render($.text._.iconOut)
//   renderIcon_(
//       @_p.input($.root._.onClick) onClickObs: Observable<unknown>,
//       @_p.input($.text._.iconIn) currentIconObs: Observable<CheckedValue>,
//   ): Observable<CheckedValue> {
//     return onClickObs
//         .pipe(
//             withLatestFrom(currentIconObs),
//             map(([, currentValue]) => {
//               switch (currentValue) {
//                 case 'unknown':
//                 case true:
//                   return false;
//                 case false:
//                   return true;
//               }
//             }),
//             startWith(false),
//         );
//   }

//   @_p.render($.text._.mode)
//   renderIconMode_(
//       @_p.input($.host._.disabled) disabledObs: Observable<boolean>,
//       @_p.input($.host._.onBlur) onBlurObs: Observable<Event>,
//       @_p.input($.host._.onFocus) onFocusObs: Observable<Event>,
//       @_p.input($.host._.onMouseEnter) onMouseEnterObs: Observable<MouseEvent>,
//       @_p.input($.host._.onMouseLeave) onMouseLeaveObs: Observable<MouseEvent>,
//   ): Observable<string> {
//     const hoverObs = merge(
//         onMouseEnterObs.pipe(mapTo(true)),
//         onMouseLeaveObs.pipe(mapTo(false)),
//     )
//     .pipe(startWith(false));

//     const focusedObs = merge(
//         onFocusObs.pipe(mapTo(true)),
//         onBlurObs.pipe(mapTo(false)),
//     )
//     .pipe(startWith(false));

//     return combineLatest(
//         disabledObs,
//         focusedObs,
//         hoverObs,
//     )
//     .pipe(
//         map(([disabled, focused, hover]) => {
//           if (disabled) {
//             return 'disabled';
//           }

//           if (hover || focused) {
//             return 'focus';
//           }

//           return 'action';
//         }),
//     );
//   }
// }
