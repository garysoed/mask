import { Vine } from 'grapevine';
import { element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { $dialogService, _p, Dialog as MaskDialog, ThemedCustomElementCtrl } from '../../export';
import { $textIconButton, TextIconButton } from '../../export/deprecated';
import { DemoLayout } from '../base/demo-layout';

import template from './dialog.html';


const $ = {
  dialogLaunchButton: element('dialogLaunchButton', $textIconButton, {}),
};


export const $$ = {
  tag: 'mkd-dialog',
  api: {},
};

@_p.customElement({
  ...$$,
  dependencies: [
    DemoLayout,
    MaskDialog,
    TextIconButton,
  ],
  template,
})
export class Dialog extends ThemedCustomElementCtrl {
  private readonly onDialogLaunchButtonAction$ =
      this.declareInput($.dialogLaunchButton._.actionEvent);

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupOnDialogLaunchButtonAction(context.vine));
  }

  private setupOnDialogLaunchButtonAction(vine: Vine): Observable<unknown> {
    return this.onDialogLaunchButtonAction$
        .pipe(
            withLatestFrom($dialogService.get(vine)),
            switchMap(([, dialogService]) => {
              return dialogService.open({
                cancelable: true,
                content: {
                  attr: new Map([['label', 'Dialog content']]),
                  tag: 'mk-icon-with-text',
                },
                title: 'Dialog title',
              });
            }),
            tap(({canceled}) => {
              window.alert(`Canceled: ${canceled}`);
            }),
        );
  }
}
