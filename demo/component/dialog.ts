import { $dialogService, $textIconButton, _p, Dialog as MaskDialog, TextIconButton, ThemedCustomElementCtrl } from 'export';
import { Vine } from 'grapevine';
import { element } from 'persona';
import { switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { DemoLayout } from '../base/demo-layout';

import template from './dialog.html';


const $ = {
  dialogLaunchButton: element('dialogLaunchButton', $textIconButton, {}),
};


export const TAG = 'mkd-dialog';

@_p.customElement({
  dependencies: [
    DemoLayout,
    MaskDialog,
    TextIconButton,
  ],
  tag: TAG,
  template,
})
export class Dialog extends ThemedCustomElementCtrl {
  private readonly onDialogLaunchButtonAction$ =
      this.declareInput($.dialogLaunchButton._.actionEvent);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.setupOnDialogLaunchButtonAction(vine);
  }

  private setupOnDialogLaunchButtonAction(vine: Vine): void {
    this.onDialogLaunchButtonAction$
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
            takeUntil(this.onDispose$),
        )
        .subscribe(({canceled}) => {
          window.alert(`Canceled: ${canceled}`);
        });
  }
}
