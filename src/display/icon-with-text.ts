// /**
//  * @webcomponent mk-icon-with-text
//  * Displays an icon using icon font and a text
//  *
//  * @attr {<string} icon Icon ligature.
//  * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
//  *     in $registeredFonts.
//  * @attr {<string} label Text to display
//  * @slot The glyph of the icon to display.
//  */

// import { createImmutableSet, ImmutableSet } from '@gs-tools/collect';
// import { ElementWithTagType, InstanceofType } from '@gs-types';
// import { attributeIn, element } from '@persona/input';
// import { attributeOut, classlist, textContent } from '@persona/output';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { _p, _v } from '../app/app';
// import { Config } from '../app/config';
// import { IconConfig } from '../configs/icon-config';
// import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
// import { stringParser } from '../util/parsers';
// import { Icon } from './icon';
// import iconWithTextTemplate from './icon-with-text.html';

// export const $$ = {
//   icon: attributeIn('icon', stringParser(), ''),
//   label: attributeIn('label', stringParser(), ''),
//   mode: attributeIn('mode', stringParser(), ''),
// };

// export const $ = {
//   host: element($$),
//   icon: element('icon', ElementWithTagType('mk-icon'), {
//     classes: classlist(),
//     icon: attributeOut('icon', stringParser()),
//     mode: attributeOut('mode', stringParser()),
//   }),
//   text: element('text', InstanceofType(HTMLDivElement), {
//     classes: classlist(),
//     text: textContent(),
//   }),
// };

// @_p.customElement({
//   dependencies: [Icon],
//   tag: 'mk-icon-with-text',
//   template: iconWithTextTemplate,
// })
// @_p.render($.text._.text).withForwarding($.host._.label)
// @_p.render($.icon._.icon).withForwarding($.host._.icon)
// @_p.render($.icon._.mode).withForwarding($.host._.mode)
// export class IconWithText extends ThemedCustomElementCtrl {
//   @_p.render($.icon._.classes)
//   renderIconClasses_(
//       @_p.input($.host._.icon) iconLigatureObs: Observable<string>,
//   ): Observable<ImmutableSet<string>> {
//     return iconLigatureObs.pipe(
//         map(iconLigature => {
//           if (!iconLigature) {
//             return createImmutableSet();
//           }

//           return createImmutableSet(['hasIcon']);
//         }),
//     );
//   }

//   @_p.render($.text._.classes)
//   renderTextClasses_(
//       @_p.input($.host._.label) labelObs: Observable<string>,
//   ): Observable<ImmutableSet<string>> {
//     return labelObs.pipe(
//         map(label => {
//           if (!label) {
//             return createImmutableSet();
//           }

//           return createImmutableSet(['hasText']);
//         }),
//     );
//   }
// }

// export interface IconWithTextConfig extends Config {
//   tag: 'mk-icon-with-text';
// }

// export function iconWithText(iconConfig: IconConfig): IconWithTextConfig {
//   return {
//     dependencies: [iconConfig],
//     tag: 'mk-icon-with-text',
//   };
// }
