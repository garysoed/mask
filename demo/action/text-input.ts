import {mutablePathSource} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$textInput, TextInput} from '../../src/action/input/text-input';
import {_p} from '../../src/app/app';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoStateId} from '../core/demo-state';

import template from './text-input.html';


export const $textInputDemo = {
  tag: 'mkd-text-input',
  api: {},
};

const $ = {
  disabledInput: element('disabledInput', $textInput, {}),
  emailInput: element('emailInput', $textInput, {}),
  enabledInput: element('enabledInput', $textInput, {}),
  telInput: element('telInput', $textInput, {}),
  urlInput: element('urlInput', $textInput, {}),
};

const disabledTextInputStatePath = mutablePathSource(
    $demoStateId,
    demo => demo._('textInputDemo')._('disabledTextInputState'),
);

const enabledTextInputStatePath = mutablePathSource(
    $demoStateId,
    demo => demo._('textInputDemo')._('enabledTextInputState'),
);

const emailTextInputStatePath = mutablePathSource(
    $demoStateId,
    demo => demo._('textInputDemo')._('emailTextInputState'),
);

const telTextInputStatePath = mutablePathSource(
    $demoStateId,
    demo => demo._('textInputDemo')._('telTextInputState'),
);

const urlTextInputStatePath = mutablePathSource(
    $demoStateId,
    demo => demo._('textInputDemo')._('urlTextInputState'),
);

@_p.customElement({
  ...$textInputDemo,
  dependencies: [
    DemoLayout,
    TextInput,
  ],
  template,
})
export class TextInputDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.disabledInput.stateId(of(disabledTextInputStatePath.get(this.vine))),
      this.renderers.emailInput.stateId(of(emailTextInputStatePath.get(this.vine))),
      this.renderers.enabledInput.stateId(of(enabledTextInputStatePath.get(this.vine))),
      this.renderers.telInput.stateId(of(telTextInputStatePath.get(this.vine))),
      this.renderers.urlInput.stateId(of(urlTextInputStatePath.get(this.vine))),
    ];
  }
}
