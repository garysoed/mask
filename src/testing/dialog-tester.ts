import { PersonaTester } from '@persona/testing';
import { Observable } from '@rxjs';
import { distinctUntilChanged, map } from '@rxjs/operators';
import { ActionEvent } from '../event/action-event';
import { $ as $dialog } from '../section/dialog';

export class DialogTester {
  private readonly dialogEl: HTMLElement;

  constructor(private readonly personaTester: PersonaTester, parent: HTMLElement|null) {
    this.dialogEl = personaTester.createElement('mk-dialog', parent);
  }

  clickCancel(): Observable<unknown> {
    return this.personaTester
        .dispatchEvent(this.dialogEl, $dialog.cancelButton._.onAction, new ActionEvent());
  }

  clickOk(): Observable<unknown> {
    return this.personaTester
        .dispatchEvent(this.dialogEl, $dialog.okButton._.onAction, new ActionEvent());
  }

  getContentObs(): Observable<HTMLElement|null> {
    return this.personaTester
        .getNodesAfter(this.dialogEl, $dialog.content._.single)
        .pipe(
            map(nodes => {
              const nextNode = nodes[0];

              return nextNode instanceof HTMLElement ? nextNode : null;
            }),
            distinctUntilChanged(),
        );
  }
}
