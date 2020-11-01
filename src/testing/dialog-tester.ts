import { BaseElementTester, ElementTester, PersonaTester } from 'persona/export/testing';
import { Observable } from 'rxjs';
import { Vine } from 'grapevine';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { filterNonNull } from 'gs-tools/export/rxjs';

import { $ as $dialog } from '../section/dialog';
import { ActionEvent } from '../event/action-event';

export class DialogTester {
  private readonly dialogEl: ElementTester;

  constructor(
      personaTester: PersonaTester,
      private readonly vine: Vine,
  ) {
    this.dialogEl = personaTester.createElement('mk-dialog');
  }

  clickCancel(): Observable<unknown> {
    return this.dialogEl.dispatchEvent(
        $dialog.cancelButton._.onAction,
        new ActionEvent(undefined),
    );
  }

  clickOk(): Observable<unknown> {
    return this.dialogEl.dispatchEvent($dialog.okButton._.onAction, new ActionEvent(undefined));
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
