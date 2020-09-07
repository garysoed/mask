import { assert, createSpySubject, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';

import { $, Crumb } from './crumb';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/display/crumb', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Crumb], document);
    const el = tester.createElement('mk-crumb');
    return {el, tester};
  });

  test('renderDispatchAction', () => {
    should(`emit correct event if clicked`, () => {
      const key = 'key';
      const actionKey$ = createSpySubject(
          fromEvent<ActionEvent<string>>(_.el.element, ACTION_EVENT).pipe(map(e => e.payload)),
      );
      run(_.el.setAttribute($.host._.key, key));

      _.el.element.click();

      assert(actionKey$).to.emitWith(key);
    });
  });
});
