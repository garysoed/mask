import { assert, match, should } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { ImmutableMap } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { icon } from '../display/icon';
import { ActionEvent } from '../event/action-event';
import { $, iconButton } from './icon-button';

const ICON_CLASS = 'iconClass';
const ICON_FONT = 'iconFont';
const FONT_URL = new URL('http://fontUrl');

const iconConfig = icon(
    '',
    ImmutableMap.of([
      [ICON_FONT, {iconClass: ICON_CLASS, url: FONT_URL}],
    ]));
const {ctor} = iconButton(iconConfig);
// tslint:disable-next-line:no-non-null-assertion
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

describe('component.IconButton', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([ctor]);
    el = tester.createElement('mk-icon-button', document.body);
  });

  describe('constructor', () => {
    should(`set the default attributes correctly`, () => {
      assert(tester.getAttribute(el, $.host.ariaDisabled)).to.equal(false);
    });
  });

  describe('activate_', () => {
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

  describe('renderIconFamily_', () => {
    should(`render the icon family correctly`, async () => {
      const iconFamily = 'iconFamily';
      await tester.setAttribute(el, $.host.iconFamily, iconFamily);

      assert(tester.getAttribute(el, $.icon.iconFamily)).to.equal(iconFamily);
    });
  });

  describe('renderRole_', () => {
    should(`render the correct role`, () => {
      assert(tester.getAttribute(el, $.host.role)).to.equal('button');
    });
  });

  describe('renderTabIndex_', () => {
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
