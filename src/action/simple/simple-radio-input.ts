import { Vine } from 'grapevine';
import { filterDefined } from 'gs-tools/export/rxjs';
import { StateId } from 'gs-tools/export/state';
import { instanceofType } from 'gs-types';
import { attributeIn, element, host, PersonaContext, stringParser, textContent } from 'persona';

import { _p } from '../../app/app';
import checkboxChecked from '../../asset/checkbox_checked.svg';
import checkboxEmpty from '../../asset/checkbox_empty.svg';
import checkboxUnknown from '../../asset/checkbox_unknown.svg';
import { stateIdParser } from '../../core/state-id-parser';
import { registerSvg } from '../../core/svg-service';
import { Icon } from '../../display/icon';
import { ListItemLayout } from '../../layout/list-item-layout';
import { ThemedCustomElementCtrl } from '../../theme/themed-custom-element-ctrl';
import { $checkbox, Checkbox, CheckedValue } from '../input/checkbox';

import template from './simple-checkbox.html';


export const $simpleCheckbox = {
  tag: 'mk-simple-checkbox',
  api: {
    stateId: attributeIn<StateId<CheckedValue>>('state-id', stateIdParser()),
    label: attributeIn('label', stringParser(), ''),
  },
};

const $ = {
  checkbox: element('checkbox', $checkbox, {}),
  checkedLabel: element('checkedLabel', instanceofType(HTMLParagraphElement), {
    text: textContent(),
  }),
  host: host($simpleCheckbox.api),
  uncheckedLabel: element('uncheckedLabel', instanceofType(HTMLParagraphElement), {
    text: textContent(),
  }),
};

@_p.customElement({
  ...$simpleCheckbox,
  template,
  configure(vine: Vine): void {
    registerSvg(
        vine,
        'mk.checkbox_checked',
        {type: 'embed', content: checkboxChecked},
    );
    registerSvg(
        vine,
        'mk.checkbox_unchecked',
        {type: 'embed', content: checkboxEmpty},
    );
    registerSvg(
        vine,
        'mk.checkbox_unknown',
        {type: 'embed', content: checkboxUnknown},
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
    this.render($.checkbox._.stateId, this.declareInput($.host._.stateId).pipe(filterDefined()));
    this.render($.checkedLabel._.text, this.declareInput($.host._.label));
    this.render($.uncheckedLabel._.text, this.declareInput($.host._.label));
  }
}
