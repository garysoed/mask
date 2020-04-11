import { assert, createSpySubject, objectThat, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent } from 'rxjs';

import { _p } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';

import { Crumb } from './crumb';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/display/crumb', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Crumb], document);
    const el = tester.createElement('mk-crumb', document.body);
    return {el, tester};
  });

  test('renderDispatchAction', () => {
    should(`emit correct event if clicked`, () => {
      const actionSubject = createSpySubject(fromEvent(_.el.element, ACTION_EVENT));

      _.el.element.click();

      assert(actionSubject).to.emitWith(objectThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });
  });
});
