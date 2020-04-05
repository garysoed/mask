import { assert, createSpySubject, objectThat, should, test } from 'gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent } from 'rxjs';

import { _p } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';

import { Crumb } from './crumb';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/display/crumb', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([Crumb]);
    el = tester.createElement('mk-crumb', document.body);
  });

  test('renderDispatchAction', () => {
    should(`emit correct event if clicked`, () => {
      const actionSubject = createSpySubject(fromEvent(el.element, ACTION_EVENT));

      el.element.click();

      assert(actionSubject).to.emitWith(
          objectThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });
  });
});
