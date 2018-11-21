import { assert, match, retryUntil, should, test } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { ActionEvent } from '../event/action-event';
import { $, textButton } from './text-button';

const {tag} = textButton();
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('component.TextButton', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([tag]);
    el = tester.createElement('mk-text-button', document.body);
  });

  test('constructor', () => {
    should(`set the default attributes correctly`, () => {
      assert(tester.getAttribute(el, $.host.ariaDisabled)).to.equal(false);
      assert(tester.getAttribute(el, $.host.ariaLabel)).to.equal('');
    });
  });

  test('activate_', () => {
    should(`fire the action event if clicked`, () => {
      const mockListener = createSpy('Listener');

      el.addEventListener('mk-action', mockListener);
      el.click();

      assert(mockListener).to.haveBeenCalledWith(match.anyThat().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing Enter`, () => {
      const mockListener = createSpy('Listener');

      el.addEventListener('mk-action', mockListener);
      tester.simulateKeypress(el, $.host.el, [{key: 'Enter'}]);
      assert(mockListener).to.haveBeenCalledWith(match.anyThat().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing space`, () => {
      const mockListener = createSpy('Listener');

      el.addEventListener('mk-action', mockListener);
      tester.simulateKeypress(el, $.host.el, [{key: ' '}]);
      assert(mockListener).to.haveBeenCalledWith(match.anyThat().beAnInstanceOf(ActionEvent));
    });

    should(`not fire the action event if disabled`, async () => {
      const mockListener = createSpy('Listener');

      await tester.setAttribute(el, $.host.disabled, true);
      el.addEventListener('mk-action', mockListener);
      el.click();

      assert(mockListener).toNot.haveBeenCalled();
    });
  });

  test('renderLabel_', () => {
    should(`render the label correctly`, async () => {
      const newLabel = 'newLabel';
      await tester.setAttribute(el, $.host.label, newLabel);

      assert(tester.getTextContent(el, $.root.text)).to.equal(newLabel);
    });
  });

  test('renderHostAriaLabel_', () => {
    should(`render the aria label if given`, async () => {
      const newLabel = 'newLabel';
      await tester.setAttribute(el, $.host.ariaLabel, newLabel);

      assert(tester.getAttribute(el, $.host.ariaLabel)).to.equal(newLabel);
    });

    should(`render the label if aria-label is not given`, async () => {
      const newLabel = 'newLabel';
      await tester.setAttribute(el, $.host.label, newLabel);

      assert(tester.getAttribute(el, $.host.ariaLabel)).to.equal(newLabel);
    });
  });

  test('renderRole_', () => {
    should(`render the correct role`, () => {
      assert(tester.getAttribute(el, $.host.role)).to.equal('button');
    });
  });

  test('renderTabIndex_', () => {
    should(`render 0 if host is not disabled`, async () => {
      await tester.setAttribute(el, $.host.disabled, false);

      assert(tester.getAttribute(el, $.host.tabindex)).to.equal(0);
    });

    should(`return -1 if host is disabled`, async () => {
      await tester.setAttribute(el, $.host.disabled, true);

      assert(tester.getAttribute(el, $.host.tabindex)).to.equal(-1);
    });
  });
});
