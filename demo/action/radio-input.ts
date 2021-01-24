import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {element, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {$radioInput, RadioInput} from '../../src/action/input/radio-input';
import {_p} from '../../src/app/app';
import radioUnchecked from '../../src/asset/checkbox_empty.svg';
import radioChecked from '../../src/asset/radio_checked.svg';
import {registerSvg} from '../../src/core/svg-service';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
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
  optionD: element('optionD', $radioInput, {}),
};

@_p.customElement({
  ...$radioInputDemo,
  template,
  dependencies: [
    RadioInput,
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
export class RadioInputDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.optionA.stateId(this.stateId$),
      this.renderers.optionB.stateId(this.stateId$),
      this.renderers.optionC.stateId(this.stateId$),
      this.renderers.optionD.stateId(this.stateId$),
    ];
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
        filterNonNullable(),
    );
  }
}
