import { anyThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent } from 'rxjs';

import { _p } from '../app/app';
import { ActionEvent } from '../event/action-event';

import { $, TextIconButton } from './text-icon-button';


const testerFactory = new PersonaTesterFactory(_p);

test('component.TextIconButton', init => {
  const _ = init(_ => {
    const tester = testerFactory.build([TextIconButton], document);
    const el = tester.createElement('mk-text-icon-button');

    return {el, tester};
  });

  test('renderDispatchActions', _, init => {
    const _ = init(_ => {
      const actionSubject = createSpySubject(fromEvent(_.el.element, 'mk-action'));
      return {..._, actionSubject};
    });

    should(`fire the action event if clicked`, () => {
      _.el.element.click();
      assert(_.actionSubject).to.emitWith(anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing Enter`, () => {
      run(_.el.simulateKeypress($.host, [{key: 'Enter'}]));
      assert(_.actionSubject).to
          .emitWith(anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing space`, () => {
      run(_.el.simulateKeypress($.host, [{key: ' '}]));
      assert(_.actionSubject).to
          .emitWith(anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`not fire the action event if disabled`, () => {
      run(_.el.setHasAttribute($.host._.disabled, true));

      _.el.element.click();
      assert(_.actionSubject).toNot.emit();
    });
  });

  test('renderHostAriaLabel', () => {
    should(`render the aria label if given`, () => {
      const newLabel = 'newLabel';
      run(_.el.setAttribute($.host._.ariaLabelIn, newLabel));

      assert(_.el.getAttribute($.host._.ariaLabelOut)).to.emitWith(newLabel);
    });

    should(`render the label if aria-label is not given`, () => {
      const newLabel = 'newLabel';
      run(_.el.setAttribute($.host._.label, newLabel));

      assert(_.el.getAttribute($.host._.ariaLabelOut)).to.emitWith(newLabel);
    });
  });

  test('renderIconMode', () => {
    should(`render "action" if not primary, hovered, focused, or disabled`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, false));
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.setHasAttribute($.host._.active, false));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('action');
    });

    should(`render "actionPrimary" if primary`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, true));
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.setHasAttribute($.host._.active, false));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('actionPrimary');
    });

    should(`render "active" if active and not primary`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, false));
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.setHasAttribute($.host._.active, true));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('active');
    });

    should(`render "active" if active and primary`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, true));
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.setHasAttribute($.host._.active, true));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('active');
    });

    should(`render "focus" if hovered and not primary`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, false));
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.setHasAttribute($.host._.active, false));
      run(_.el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('focus');
    });

    should(`render "focus" if focused and not primary`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, false));
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.setHasAttribute($.host._.active, false));
      run(_.el.dispatchEvent($.host._.onFocus, new CustomEvent('focus')));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('focus');
    });

    should(`render "primaryFocus" if hovered and primary`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, true));
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.setHasAttribute($.host._.active, false));
      run(_.el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('primaryFocus');
    });

    should(`render "primaryFocus if focused and primary`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, true));
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.setHasAttribute($.host._.active, false));
      run(_.el.dispatchEvent($.host._.onFocus, new CustomEvent('focus')));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('primaryFocus');
    });

    should(`render "disabled" if disabled and not primary`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, false));
      run(_.el.setHasAttribute($.host._.disabled, true));
      run(_.el.setHasAttribute($.host._.active, false));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('disabled');
    });

    should(`render "primaryDisabled" if disabled and primary`, () => {
      run(_.el.setHasAttribute($.host._.hasMkPrimary, true));
      run(_.el.setHasAttribute($.host._.disabled, true));
      run(_.el.setHasAttribute($.host._.active, false));

      assert(_.el.getAttribute($.iconWithText._.mode)).to.emitWith('primaryDisabled');
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
