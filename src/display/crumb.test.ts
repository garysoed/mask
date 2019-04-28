import { assert, createSpySubject, match, should, test } from '@gs-testing';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { fromEvent } from '@rxjs';
import { _p } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { Crumb } from './crumb';

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/display/crumb', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([Crumb]);
    el = tester.createElement('mk-crumb', document.body);
  });

  test('renderDispatchAction', () => {
    should(`emit correct event if clicked`, async () => {
      const actionSubject = createSpySubject();
      fromEvent(el, ACTION_EVENT).subscribe(actionSubject);

      el.click();

      await assert(actionSubject).to.emitWith(
          match.anyObjectThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });
  });
});
