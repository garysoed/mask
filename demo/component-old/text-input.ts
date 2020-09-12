// import { element, integerParser, PersonaContext } from 'persona';
// import { Observable, of as observableOf } from 'rxjs';

// import { $textInput, _p, TextInput as MaskTextInput, ThemedCustomElementCtrl } from '../../export';
// import { DemoLayout } from '../base/demo-layout';

// import template from './text-input.html';


// export const $$ = {
//   tag: 'mkd-text-input',
//   api: {},
// };

// const $ = {
//   validatedNumberInput: element('validatedNumberInput', $textInput, {}),
// };

// @_p.customElement({
//   ...$$,
//   dependencies: [
//     DemoLayout,
//     MaskTextInput,
//   ],
//   template,
// })
// export class TextInput extends ThemedCustomElementCtrl {
//   constructor(context: PersonaContext) {
//     super(context);

//     this.render($.validatedNumberInput._.setValidator, this.renderValidator());
//   }

//   private renderValidator(): Observable<[Function]> {
//     return observableOf([(str: string) => {
//       const parseResult = integerParser().convertBackward(str);
//       if (!parseResult.success) {
//         return false;
//       }

//       const numValue = parseResult.result;
//       return numValue >= 0 && numValue < 5;
//     }]);
//   }
// }
