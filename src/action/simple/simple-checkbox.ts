import { filterDefined } from 'gs-tools/export/rxjs';
import { StateId } from 'gs-tools/export/state';
import { instanceofType } from 'gs-types';
import { attributeIn, element, host, PersonaContext, stringParser, textContent } from 'persona';

import { _p } from '../../app/app';
import { stateIdParser } from '../../core/state-id-parser';
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
  dependencies: [
    Checkbox,
    Icon,
    ListItemLayout,
  ],
})
export class SimpleCheckbox extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.render($.checkbox._.stateId, this.declareInput($.host._.stateId).pipe(filterDefined()));
    this.render($.checkedLabel._.text, this.declareInput($.host._.label));
    this.render($.uncheckedLabel._.text, this.declareInput($.host._.label));
  }
}
