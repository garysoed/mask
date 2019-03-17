import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpySubject } from 'gs-testing/export/spy';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent } from 'rxjs';
import { _p, _v } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { Crumb } from './crumb';

const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('display.crumb', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([Crumb]);
    el = tester.createElement('mk-crumb', document.body);
  });

  test('renderDispatchAction_', () => {
    should(`emit correct event if clicked`, async () => {
      const actionSubject = createSpySubject();
      fromEvent(el, ACTION_EVENT).subscribe(actionSubject);

      el.click();

      await assert(actionSubject).to.emitWith(
          match.anyObjectThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });
  });
});
