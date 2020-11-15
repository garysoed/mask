import {cache} from 'gs-tools/export/data';
import {filterNonNull} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {element, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {$radioInput, RadioInput} from '../../src/action/input/radio-input';
import {$simpleRadioInput, SimpleRadioInput} from '../../src/action/simple/simple-radio-input';
import {_p} from '../../src/app/app';
import radioUnchecked from '../../src/asset/checkbox_empty.svg';
import radioChecked from '../../src/asset/radio_checked.svg';
import {registerSvg} from '../../src/core/svg-service';
import {ThemedCustomElementCtrl} from '../../src/theme/themed-custom-element-ctrl';
import {$demoState} from '../core/demo-state';

import template from './radio-input.html';


export const $radioInputDemo = {
  tag: 'mkd-radio-input',
  api: {},
};

const $ = {
  optionA: element('optionA', $radioInput, {}),
  optionB: element('optionB', $radioInput, {}),
  optionC: element('optionC', $radioInput, {}),
  optionD: element('optionD', $simpleRadioInput, {}),
};

@_p.customElement({
  ...$radioInputDemo,
  template,
  dependencies: [
    RadioInput,
    SimpleRadioInput,
  ],
  configure: vine => {
    registerSvg(
        vine,
        'mk.radio_checked',
        {type: 'embed', content: radioChecked},
    );
    registerSvg(
        vine,
        'mk.radio_unchecked',
        {type: 'embed', content: radioUnchecked},
    );
  },
})
export class RadioInputDemo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.optionA._.stateId, this.stateId$);
    this.render($.optionB._.stateId, this.stateId$);
    this.render($.optionC._.stateId, this.stateId$);
    this.render($.optionD._.stateId, this.stateId$);
  }

  @cache()
  private get stateId$(): Observable<StateId<number|null>> {
    return $demoState.get(this.vine).pipe(
        map(demoState => {
          if (!demoState) {
            return null;
          }

          return demoState.radioInputDemo.$selectedIndex;
        }),
        filterNonNull(),
    );
  }
}
