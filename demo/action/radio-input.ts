import {mutablePathSource} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$radioInput, RadioInput} from '../../src/action/input/radio-input';
import {_p} from '../../src/app/app';
import radioUnchecked from '../../src/asset/checkbox_empty.svg';
import radioChecked from '../../src/asset/radio_checked.svg';
import {registerSvg} from '../../src/core/svg-service';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {$demoStateId} from '../core/demo-state';

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

const statePath = mutablePathSource($demoStateId, demo => demo._('radioInputDemo')._('selectedIndex'));

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
      this.renderers.optionA.stateId(of(statePath.get(this.vine))),
      this.renderers.optionB.stateId(of(statePath.get(this.vine))),
      this.renderers.optionC.stateId(of(statePath.get(this.vine))),
      this.renderers.optionD.stateId(of(statePath.get(this.vine))),
    ];
  }
}
