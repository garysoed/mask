import { assert, match, setup, should, test } from 'gs-testing/export/main';
import { createSpy, createSpySubject } from 'gs-testing/export/spy';
import { ImmutableMap } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { icon } from '../display/icon';
import { iconWithText } from '../display/icon-with-text';
import { ActionEvent } from '../event/action-event';
import { $, textIconButton } from './text-icon-button';

const ICON_FONT = 'iconFont';
const FONT_URL = 'http://fontUrl';

const iconConfig = icon(
    ImmutableMap.of([
      [ICON_FONT, {type: 'remote' as 'remote', url: FONT_URL}],
    ]));
const {tag} = textIconButton(iconWithText(iconConfig));
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('component.TextIconButton', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([tag]);
    el = tester.createElement('mk-text-icon-button', document.body);
  });

  test('constructor', () => {
    should(`set the default attributes correctly`, () => {
      const ariaDisabledSubject = createSpySubject<boolean>();
      tester.getAttribute(el, $.host._.ariaDisabled).subscribe(ariaDisabledSubject);

      const ariaLabelOutSubject = createSpySubject<string>();
      tester.getAttribute(el, $.host._.ariaLabelOut).subscribe(ariaLabelOutSubject);

      assert(ariaDisabledSubject.getValue()).to.equal(false);
      assert(ariaLabelOutSubject.getValue()).to.equal('');
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
      tester.simulateKeypress(el, $.host, [{key: 'Enter'}]).subscribe();
      assert(mockListener).to.haveBeenCalledWith(match.anyThat().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing space`, () => {
      const mockListener = createSpy('Listener');

      el.addEventListener('mk-action', mockListener);
      tester.simulateKeypress(el, $.host, [{key: ' '}]).subscribe();
      assert(mockListener).to.haveBeenCalledWith(match.anyThat().beAnInstanceOf(ActionEvent));
    });

    should(`not fire the action event if disabled`, () => {
      const mockListener = createSpy('Listener');

      tester.setAttribute(el, $.host._.disabled, true).subscribe();
      el.addEventListener('mk-action', mockListener);
      el.click();
      assert(mockListener).toNot.haveBeenCalled();
    });
  });

  test('renderHostAriaLabel_', () => {
    should(`render the aria label if given`, () => {
      const newLabel = 'newLabel';
      tester.setAttribute(el, $.host._.ariaLabelIn, newLabel).subscribe();

      const ariaLabelOutSubject = createSpySubject<string>();
      tester.getAttribute(el, $.host._.ariaLabelOut).subscribe(ariaLabelOutSubject);
      assert(ariaLabelOutSubject.getValue()).to.equal(newLabel);
    });

    should(`render the label if aria-label is not given`, () => {
      const newLabel = 'newLabel';
      tester.setAttribute(el, $.host._.label, newLabel).subscribe();

      const ariaLabelOutSubject = createSpySubject<string>();
      tester.getAttribute(el, $.host._.ariaLabelOut).subscribe(ariaLabelOutSubject);
      assert(ariaLabelOutSubject.getValue()).to.equal(newLabel);
    });
  });

  test('renderIcon_', () => {
    should(`render the icon correctly`, async () => {
      const icon = 'icon';
      tester.setAttribute(el, $.host._.icon, icon).subscribe();

      const iconSubject = createSpySubject<string>();
      tester.getAttribute(el, $.iconWithText._.icon).subscribe(iconSubject);
      assert(iconSubject.getValue()).to.equal(icon);
    });
  });

  test('renderLabel_', () => {
    should(`render the label correctly`, async () => {
      const newLabel = 'newLabel';
      await tester.setAttribute_(el, $.host.label, newLabel);
      assert(tester.getAttribute_(el, $.iconWithText.label)).to.equal(newLabel);
    });
  });

  test('renderRole_', () => {
    should(`render the correct role`, () => {
      assert(tester.getAttribute_(el, $.host.role)).to.equal('button');
    });
  });

  test('renderTabIndex_', () => {
    should(`render 0 if host is not disabled`, async () => {
      await tester.setAttribute_(el, $.host.disabled, false);
      assert(tester.getAttribute_(el, $.host.tabindex)).to.equal(0);
    });

    should(`return -1 if host is disabled`, async () => {
      await tester.setAttribute_(el, $.host.disabled, true);
      assert(tester.getAttribute_(el, $.host.tabindex)).to.equal(-1);
    });
  });
});
