import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { crumb } from './crumb';

const {tag} = crumb();
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('display.crumb', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([tag]);
    el = tester.createElement('mk-crumb', document.body);
  });

  test('onHostClick_', () => {
    should(`emit correct event if clicked`, async () => {
      const handler = createSpy('handler');
      el.addEventListener(ACTION_EVENT, handler);

      el.click();

      assert(handler).to.haveBeenCalledWith(
          match.anyObjectThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });
  });
});
