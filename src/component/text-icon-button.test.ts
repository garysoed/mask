import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { ImmutableMap } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { icon } from '../display/icon';
import { iconWithText } from '../display/icon-with-text';
import { ActionEvent } from '../event/action-event';
import { $, textIconButton } from './text-icon-button';

const ICON_CLASS = 'iconClass';
const ICON_FONT = 'iconFont';
const FONT_URL = new URL('http://fontUrl');

const iconConfig = icon(
    '',
    ImmutableMap.of([
      [ICON_FONT, {iconClass: ICON_CLASS, url: FONT_URL}],
    ]));
const {tag} = textIconButton(iconWithText(iconConfig));
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('component.TextIconButton', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([tag]);
    el = tester.createElement('mk-text-icon-button', document.body);
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

  test('renderIcon_', () => {
    should(`render the icon correctly`, async () => {
      const icon = 'icon';
      await tester.setAttribute(el, $.host.icon, icon);
      assert(tester.getAttribute(el, $.iconWithText.icon)).to.equal(icon);
    });
  });

  test('renderLabel_', () => {
    should(`render the label correctly`, async () => {
      const newLabel = 'newLabel';
      await tester.setAttribute(el, $.host.label, newLabel);
      assert(tester.getAttribute(el, $.iconWithText.label)).to.equal(newLabel);
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
