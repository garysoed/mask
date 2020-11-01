import { PersonaContext, attributeIn, element, host, integerParser, stringParser, textContent } from 'persona';
import { StateId } from 'gs-tools/export/state';
import { Vine } from 'grapevine';
import { filterDefined } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';

import { $radioInput, RadioInput } from '../input/radio-input';
import { Icon } from '../../display/icon';
import { ListItemLayout } from '../../layout/list-item-layout';
import { ThemedCustomElementCtrl } from '../../theme/themed-custom-element-ctrl';
import { _p } from '../../app/app';
import { registerSvg } from '../../core/svg-service';
import { stateIdParser } from '../../core/state-id-parser';
import radioChecked from '../../asset/radio_checked.svg';
import radioUnchecked from '../../asset/checkbox_empty.svg';

import template from './simple-radio-input.html';


export const $simpleRadioInput = {
  tag: 'mk-simple-radio-input',
  api: {
    stateId: attributeIn<StateId<number|null>>('state-id', stateIdParser()),
    label: attributeIn('label', stringParser(), ''),
    index: attributeIn('index', integerParser()),
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
    Icon,
    ListItemLayout,
    RadioInput,
  ],
})
export class SimpleRadioInput extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.render($.input._.stateId, this.declareInput($.host._.stateId).pipe(filterDefined()));
    this.render($.input._.index, this.declareInput($.host._.index));
    this.render($.checkedLabel._.text, this.declareInput($.host._.label));
    this.render($.uncheckedLabel._.text, this.declareInput($.host._.label));
  }
}
