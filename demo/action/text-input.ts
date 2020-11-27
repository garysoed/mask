import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {element, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {$textInput, TextInput} from '../../src/action/input/text-input';
import {_p} from '../../src/app/app';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoState} from '../core/demo-state';

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
      this.renderers.disabledInput.stateId(this.disabledInputStateId$),
      this.renderers.emailInput.stateId(this.emailInputStateId$),
      this.renderers.enabledInput.stateId(this.enabledInputStateId$),
      this.renderers.telInput.stateId(this.telInputStateId$),
      this.renderers.urlInput.stateId(this.urlInputStateId$),
    ];
  }

  @cache()
  private get disabledInputStateId$(): Observable<StateId<string>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.textInputDemo.$disabledTextInputState),
    );
  }

  @cache()
  private get emailInputStateId$(): Observable<StateId<string>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.textInputDemo.$emailTextInputState),
    );
  }

  @cache()
  private get enabledInputStateId$(): Observable<StateId<string>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.textInputDemo.$enabledTextInputState),
    );
  }

  @cache()
  private get telInputStateId$(): Observable<StateId<string>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.textInputDemo.$telTextInputState),
    );
  }

  @cache()
  private get urlInputStateId$(): Observable<StateId<string>|undefined> {
    return $demoState.get(this.vine).pipe(
        map(demoState => demoState?.textInputDemo.$urlTextInputState),
    );
  }
}
