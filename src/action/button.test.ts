import { anyThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent } from 'rxjs';

import { _p } from '../app/app';
import { ActionEvent } from '../event/action-event';

import { $, $button, Button } from './button';


const testerFactory = new PersonaTesterFactory(_p);


test('@mask/action/button', init => {
  const _ = init(_ => {
    const tester = testerFactory.build([Button], document);
    const el = tester.createElement($button.tag);

    return {el, tester};
  });

  test('onAction$', _, init => {
    const _ = init(_ => {
      const actionSubject = createSpySubject(fromEvent(_.el.element, 'mk-action'));
      return {..._, actionSubject};
    });

    should(`fire the action event if clicked`, () => {
      _.el.element.click();
      assert(_.actionSubject).to.emitWith(
          anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent),
      );
    });

    should(`fire the action event on pressing Enter`, () => {
      run(_.el.simulateKeypress($.host, [{key: 'Enter'}]));
      assert(_.actionSubject).to
          .emitWith(anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing space`, () => {
      run(_.el.simulateKeypress($.host, [{key: ' '}]));
      assert(_.actionSubject).to
          .emitWith(anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent));
    });

    should(`not fire the action event if disabled`, () => {
      run(_.el.setHasAttribute($.host._.disabled, true));

      _.el.element.click();
      assert(_.actionSubject).toNot.emit();
    });
  });

  test('isPrimaryAction$', () => {
    should(`render mk-action-1 if primary`, () => {
      run(_.el.setHasAttribute($.host._.isSecondary, false));

      assert(_.el.hasAttribute($.host._.action1)).to.emitSequence([true]);
      assert(_.el.hasAttribute($.host._.action2)).to.emitSequence([false]);
    });

    should(`render mk-action-2 if secondary`, () => {
      run(_.el.setHasAttribute($.host._.isSecondary, true));

      assert(_.el.hasAttribute($.host._.action1)).to.emitSequence([false]);
      assert(_.el.hasAttribute($.host._.action2)).to.emitSequence([true]);
    });
  });

  test('renderTabIndex', () => {
    should(`render 0 if host is not disabled`, () => {
      run(_.el.setHasAttribute($.host._.disabled, false));
      assert(_.el.getAttribute($.host._.tabindex)).to.emitWith(0);
    });

    should(`return -1 if host is disabled`, () => {
      run(_.el.setHasAttribute($.host._.disabled, true));
      assert(_.el.getAttribute($.host._.tabindex)).to.emitWith(-1);
    });
  });
});
