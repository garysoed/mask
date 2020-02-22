import { Vine } from 'grapevine';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { BaseElementTester, ElementTester, PersonaTester } from 'persona/export/testing';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { ActionEvent } from '../event/action-event';
import { $ as $dialog } from '../section/dialog';

export class DialogTester {
  private readonly dialogEl: ElementTester;

  constructor(
      personaTester: PersonaTester,
      parent: HTMLElement|null,
      private readonly vine: Vine,
  ) {
    this.dialogEl = personaTester.createElement('mk-dialog', parent);
  }

  clickCancel(): Observable<unknown> {
    return this.dialogEl.dispatchEvent($dialog.cancelButton._.onAction, new ActionEvent());
  }

  clickOk(): Observable<unknown> {
    return this.dialogEl.dispatchEvent($dialog.okButton._.onAction, new ActionEvent());
  }

  getContentObs(): BaseElementTester {
    const elementObs = this.dialogEl.getNodesAfter($dialog.content._.single)
        .pipe(
            map(nodes => {
              const nextNode = nodes[0];

              return nextNode instanceof HTMLElement ? nextNode : null;
            }),
            distinctUntilChanged(),
            filterNonNull(),
        );

    return new BaseElementTester(elementObs, this.vine);
  }
}
