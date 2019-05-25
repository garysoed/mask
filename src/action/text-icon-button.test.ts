import { assert, createSpySubject, match, runEnvironment, setup, should, test } from '@gs-testing';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { fromEvent, Subject } from '@rxjs';
import { _p } from '../app/app';
import { ActionEvent } from '../event/action-event';
import { $, TextIconButton } from './text-icon-button';

const testerFactory = new PersonaTesterFactory(_p);

test('component.TextIconButton', () => {
  runEnvironment(new PersonaTesterEnvironment());

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([TextIconButton]);
    el = tester.createElement('mk-text-icon-button', document.body);
  });

  test('renderDispatchActions', () => {
    let actionSubject: Subject<ActionEvent>;

    setup(() => {
      actionSubject = createSpySubject();
      fromEvent(el, 'mk-action').subscribe(actionSubject);
    });

    should(`fire the action event if clicked`, () => {
      el.click();
      assert(actionSubject).to
          .emitWith(match.anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing Enter`, () => {
      tester.simulateKeypress(el, $.host, [{key: 'Enter'}]).subscribe();
      assert(actionSubject).to
          .emitWith(match.anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing space`, () => {
      tester.simulateKeypress(el, $.host, [{key: ' '}]).subscribe();
      assert(actionSubject).to
          .emitWith(match.anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`not fire the action event if disabled`, () => {
      tester.setHasAttribute(el, $.host._.disabled, true).subscribe();

      el.click();
      assert(actionSubject).toNot.emit();
    });
  });

  test('renderHostAriaLabel', () => {
    should(`render the aria label if given`, () => {
      const newLabel = 'newLabel';
      tester.setAttribute(el, $.host._.ariaLabelIn, newLabel).subscribe();

      assert(tester.getAttribute(el, $.host._.ariaLabelOut)).to.emitWith(newLabel);
    });

    should(`render the label if aria-label is not given`, () => {
      const newLabel = 'newLabel';
      tester.setAttribute(el, $.host._.label, newLabel).subscribe();

      assert(tester.getAttribute(el, $.host._.ariaLabelOut)).to.emitWith(newLabel);
    });
  });

  test('renderIconMode', () => {
    should(`render "action" if not primary, hovered, focused, or disabled`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, false).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.setHasAttribute(el, $.host._.active, false).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('action');
    });

    should(`render "actionPrimary" if primary`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, true).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.setHasAttribute(el, $.host._.active, false).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('actionPrimary');
    });

    should(`render "active" if active and not primary`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, false).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.setHasAttribute(el, $.host._.active, true).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('active');
    });

    should(`render "active" if active and primary`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, true).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.setHasAttribute(el, $.host._.active, true).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('active');
    });

    should(`render "focus" if hovered and not primary`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, false).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.setHasAttribute(el, $.host._.active, false).subscribe();
      tester.dispatchEvent(el, $.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('focus');
    });

    should(`render "focus" if focused and not primary`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, false).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.setHasAttribute(el, $.host._.active, false).subscribe();
      tester.dispatchEvent(el, $.host._.onFocus, new CustomEvent('focus')).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('focus');
    });

    should(`render "primaryFocus" if hovered and primary`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, true).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.setHasAttribute(el, $.host._.active, false).subscribe();
      tester.dispatchEvent(el, $.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('primaryFocus');
    });

    should(`render "primaryFocus if focused and primary`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, true).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.setHasAttribute(el, $.host._.active, false).subscribe();
      tester.dispatchEvent(el, $.host._.onFocus, new CustomEvent('focus')).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('primaryFocus');
    });

    should(`render "disabled" if disabled and not primary`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, false).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, true).subscribe();
      tester.setHasAttribute(el, $.host._.active, false).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('disabled');
    });

    should(`render "primaryDisabled" if disabled and primary`, () => {
      tester.setHasAttribute(el, $.host._.hasMkPrimary, true).subscribe();
      tester.setHasAttribute(el, $.host._.disabled, true).subscribe();
      tester.setHasAttribute(el, $.host._.active, false).subscribe();

      assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('primaryDisabled');
    });
  });

  test('renderTabIndex', () => {
    should(`render 0 if host is not disabled`, () => {
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      assert(tester.getAttribute(el, $.host._.tabindex)).to.emitWith(0);
    });

    should(`return -1 if host is disabled`, () => {
      tester.setHasAttribute(el, $.host._.disabled, true).subscribe();
      assert(tester.getAttribute(el, $.host._.tabindex)).to.emitWith(-1);
    });
  });
});
