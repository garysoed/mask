import { Vine } from 'grapevine';
import { filterDefined } from 'gs-tools/export/rxjs';
import { StateId } from 'gs-tools/export/state';
import { instanceofType } from 'gs-types';
import { attributeIn, element, host, PersonaContext, stringParser, textContent } from 'persona';

import { _p } from '../../app/app';
import { stateIdParser } from '../../core/state-id-parser';
import { registerSvg } from '../../core/svg-service';
import { Icon } from '../../display/icon';
import { ListItemLayout } from '../../layout/list-item-layout';
import radioUnchecked from '../../src/asset/checkbox_empty.svg';
import radioChecked from '../../src/asset/radio_checked.svg';
import { ThemedCustomElementCtrl } from '../../theme/themed-custom-element-ctrl';
import { Checkbox } from '../input/checkbox';
import { $radioInput } from '../input/radio-input';

import template from './simple-radio-input.html';


export const $simpleRadioInput = {
  tag: 'mk-simple-radio-input',
  api: {
    stateId: attributeIn<StateId<number|null>>('state-id', stateIdParser()),
    label: attributeIn('label', stringParser(), ''),
  },
};

const $ = {
  input: element('input', $radioInput, {}),
  checkedLabel: element('checkedLabel', instanceofType(HTMLParagraphElement), {
    text: textContent(),
  }),
  host: host($simpleRadioInput.api),
  uncheckedLabel: element('uncheckedLabel', instanceofType(HTMLParagraphElement), {
    text: textContent(),
  }),
};

@_p.customElement({
  ...$simpleRadioInput,
  template,
  configure(vine: Vine): void {
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
  dependencies: [
    Checkbox,
    Icon,
    ListItemLayout,
  ],
})
export class SimpleRadioInput extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.render($.input._.stateId, this.declareInput($.host._.stateId).pipe(filterDefined()));
    this.render($.checkedLabel._.text, this.declareInput($.host._.label));
    this.render($.uncheckedLabel._.text, this.declareInput($.host._.label));
  }
}
