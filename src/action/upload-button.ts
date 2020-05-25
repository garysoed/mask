import { $asArray, $map, $pipe, arrayFrom } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, dispatcher, element, handler, hasAttribute, host, onDom, PersonaContext, setAttribute, stringParser, textContent } from 'persona';
import { merge, Observable } from 'rxjs';
import { map, mapTo, startWith, tap, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';

import { $$ as $baseAction, BaseAction } from './base-action';
import { $$ as $textIconButton, TextIconButton } from './text-icon-button';
import template from './upload-button.html';


export const $$ = {
  tag: 'mk-upload-button',
  api: {
    ...$baseAction.api,
    actionEvent: dispatcher<ActionEvent<readonly File[]>>(ACTION_EVENT),
    accept: attributeIn('accept', stringParser(), ''),
    label: attributeIn('label', stringParser(), ''),
    multiple: hasAttribute('multiple'),
    reset: handler('reset'),
  },
};

export const $ = {
  host: host($$.api),
  button: element('button', $textIconButton, {}),
  files: element('files', instanceofType(HTMLDivElement), {
    text: textContent(),
  }),
  input: element('input', instanceofType(HTMLInputElement), {
    accept: attributeOut('accept', stringParser()),
    multiple: setAttribute('multiple'),
    onInput: onDom('input'),
  }),
};

@_p.customElement({
  ...$$,
  template,
  dependencies: [
    TextIconButton,
  ],
})
export class UploadButton extends BaseAction {
  private readonly onInput$ = this.declareInput($.input._.onInput);
  private readonly onReset$ = this.declareInput($.host._.reset);
  private readonly inputEl$ = this.declareInput($.input);

  constructor(context: PersonaContext) {
    super($.button._.disabled, context);

    this.render($.host._.actionEvent, this.renderActionEvent());
    this.render($.button._.label, this.declareInput($.host._.label));
    this.render($.files._.text, this.renderFiles());
    this.render($.input._.multiple, this.declareInput($.host._.multiple));
    this.render($.input._.accept, this.declareInput($.host._.accept));
    this.addSetup(this.setupHandleReset());
  }

  @cache()
  private get files$(): Observable<readonly File[]> {
    const onInput$ = this.onInput$.pipe(
        withLatestFrom(this.inputEl$),
        map(([, element]) => {
          const files = element.files;
          return files ? arrayFrom(files) : [];
        }),
    );

    const onReset$ = this.onReset$.pipe(mapTo([]));

    return merge(onInput$, onReset$).pipe(startWith([]));
  }

  private renderActionEvent(): Observable<ActionEvent<readonly File[]>> {
    return this.onInput$.pipe(
        withLatestFrom(this.files$),
        map(([, files]) => new ActionEvent(files)),
    );
  }

  private renderFiles(): Observable<string> {
    return this.files$.pipe(
        map(files => $pipe(files, $map(file => file.name), $asArray()).join(', ')),
    );
  }

  private setupHandleReset(): Observable<unknown> {
    return this.onReset$.pipe(
        withLatestFrom(this.inputEl$),
        tap(([, inputEl]) => {
          inputEl.value = '';
        }),
    );
  }
}
