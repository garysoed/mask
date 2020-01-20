import { anyThat, assert, createSpySubject, setup, should, test } from '@gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { fromEvent, Subject } from '@rxjs';

import { _p } from '../app/app';
import { ActionEvent } from '../event/action-event';

import { $, TextIconButton } from './text-icon-button';

const testerFactory = new PersonaTesterFactory(_p);

test('component.TextIconButton', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([TextIconButton]);
    el = tester.createElement('mk-text-icon-button', document.body);
  });

  test('renderDispatchActions', () => {
    let actionSubject: Subject<ActionEvent>;

    setup(() => {
      actionSubject = createSpySubject();
      fromEvent(el.element, 'mk-action').subscribe(actionSubject);
    });

    should(`fire the action event if clicked`, () => {
      el.element.click();
      assert(actionSubject).to
          .emitWith(anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing Enter`, () => {
      el.simulateKeypress($.host, [{key: 'Enter'}]).subscribe();
      assert(actionSubject).to
          .emitWith(anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing space`, () => {
      el.simulateKeypress($.host, [{key: ' '}]).subscribe();
      assert(actionSubject).to
          .emitWith(anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`not fire the action event if disabled`, () => {
      el.setHasAttribute($.host._.disabled, true).subscribe();

      el.element.click();
      assert(actionSubject).toNot.emit();
    });
  });

  test('renderHostAriaLabel', () => {
    should(`render the aria label if given`, () => {
      const newLabel = 'newLabel';
      el.setAttribute($.host._.ariaLabelIn, newLabel).subscribe();

      assert(el.getAttribute($.host._.ariaLabelOut)).to.emitWith(newLabel);
    });

    should(`render the label if aria-label is not given`, () => {
      const newLabel = 'newLabel';
      el.setAttribute($.host._.label, newLabel).subscribe();

      assert(el.getAttribute($.host._.ariaLabelOut)).to.emitWith(newLabel);
    });
  });

  test('renderIconMode', () => {
    should(`render "action" if not primary, hovered, focused, or disabled`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, false).subscribe();
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.setHasAttribute($.host._.active, false).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('action');
    });

    should(`render "actionPrimary" if primary`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, true).subscribe();
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.setHasAttribute($.host._.active, false).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('actionPrimary');
    });

    should(`render "active" if active and not primary`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, false).subscribe();
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.setHasAttribute($.host._.active, true).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('active');
    });

    should(`render "active" if active and primary`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, true).subscribe();
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.setHasAttribute($.host._.active, true).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('active');
    });

    should(`render "focus" if hovered and not primary`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, false).subscribe();
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.setHasAttribute($.host._.active, false).subscribe();
      el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('focus');
    });

    should(`render "focus" if focused and not primary`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, false).subscribe();
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.setHasAttribute($.host._.active, false).subscribe();
      el.dispatchEvent($.host._.onFocus, new CustomEvent('focus')).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('focus');
    });

    should(`render "primaryFocus" if hovered and primary`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, true).subscribe();
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.setHasAttribute($.host._.active, false).subscribe();
      el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('primaryFocus');
    });

    should(`render "primaryFocus if focused and primary`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, true).subscribe();
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.setHasAttribute($.host._.active, false).subscribe();
      el.dispatchEvent($.host._.onFocus, new CustomEvent('focus')).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('primaryFocus');
    });

    should(`render "disabled" if disabled and not primary`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, false).subscribe();
      el.setHasAttribute($.host._.disabled, true).subscribe();
      el.setHasAttribute($.host._.active, false).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('disabled');
    });

    should(`render "primaryDisabled" if disabled and primary`, () => {
      el.setHasAttribute($.host._.hasMkPrimary, true).subscribe();
      el.setHasAttribute($.host._.disabled, true).subscribe();
      el.setHasAttribute($.host._.active, false).subscribe();

      assert(el.getAttribute($.iconWithText._.mode)).to.emitWith('primaryDisabled');
    });
  });

  test('renderTabIndex', () => {
    should(`render 0 if host is not disabled`, () => {
      el.setHasAttribute($.host._.disabled, false).subscribe();
      assert(el.getAttribute($.host._.tabindex)).to.emitWith(0);
    });

    should(`return -1 if host is disabled`, () => {
      el.setHasAttribute($.host._.disabled, true).subscribe();
      assert(el.getAttribute($.host._.tabindex)).to.emitWith(-1);
    });
  });
});
