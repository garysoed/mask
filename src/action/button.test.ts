import { PersonaTesterFactory } from 'persona/export/testing';
import { anyThat, assert, createSpySubject, should, test } from 'gs-testing';
import { fromEvent } from 'rxjs';

import { ActionEvent } from '../event/action-event';
import { _p } from '../app/app';

import { $, $button, Button } from './button';


const testerFactory = new PersonaTesterFactory(_p);


test('@mask/action/button', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Button], document);
    const el = tester.createElement($button.tag);

    return {el, tester};
  });

  test('onAction$', _, init => {
    const _ = init(_ => {
      const actionSubject = createSpySubject(fromEvent(_.el.element, 'mk-action'));
      return {..._, actionSubject};
    });

    should('fire the action event if clicked', () => {
      _.el.element.click();
      assert(_.actionSubject).to.emitWith(
          anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent),
      );
    });

    should('fire the action event on pressing Enter', () => {
      _.el.simulateKeypress($.host, [{key: 'Enter'}]);
      assert(_.actionSubject).to
          .emitWith(anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent));
    });

    should('fire the action event on pressing space', () => {
      _.el.simulateKeypress($.host, [{key: ' '}]);
      assert(_.actionSubject).to
          .emitWith(anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent));
    });

    should('not fire the action event if disabled', () => {
      _.el.setHasAttribute($.host._.disabled, true);

      _.el.element.click();
      assert(_.actionSubject).toNot.emit();
    });
  });

  test('renderTabIndex', () => {
    should('render 0 if host is not disabled', () => {
      _.el.setHasAttribute($.host._.disabled, false);
      assert(_.el.getAttribute($.host._.tabindex)).to.emitWith(0);
    });

    should('return -1 if host is disabled', () => {
      _.el.setHasAttribute($.host._.disabled, true);
      assert(_.el.getAttribute($.host._.tabindex)).to.emitWith(-1);
    });
  });
});
