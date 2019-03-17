import { assert, match, setup, should, test } from 'gs-testing/export/main';
import { createSpy, createSpySubject, Spy } from 'gs-testing/export/spy';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { ActionEvent } from '../event/action-event';
import { $, TextIconButton } from './text-icon-button';

const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('component.TextIconButton', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([TextIconButton]);
    el = tester.createElement('mk-text-icon-button', document.body);
  });

  test('renderDispatchActions_', () => {
    let actionSubject: Subject<ActionEvent>;

    setup(() => {
      actionSubject = createSpySubject();
      fromEvent(el, 'mk-action').subscribe(actionSubject);
    });

    should(`fire the action event if clicked`, async () => {
      el.click();
      await assert(actionSubject).to
          .emitWith(match.anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing Enter`, async () => {
      tester.simulateKeypress(el, $.host, [{key: 'Enter'}]).subscribe();
      await assert(actionSubject).to
          .emitWith(match.anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`fire the action event on pressing space`, async () => {
      tester.simulateKeypress(el, $.host, [{key: ' '}]).subscribe();
      await assert(actionSubject).to
          .emitWith(match.anyThat<ActionEvent>().beAnInstanceOf(ActionEvent));
    });

    should(`not fire the action event if disabled`, async () => {
      tester.setAttribute(el, $.host._.disabled, true).subscribe();

      // Wait for the button to be disabled.
      await tester
          .getAttribute(el, $.iconWithText._.mode)
          .pipe(
              filter(mode => mode === 'disabled'),
              take(1),
          )
          .toPromise();

      el.click();
      await assert(actionSubject).toNot.emit();
    });
  });

  test('renderHostAriaLabel_', () => {
    should(`render the aria label if given`, async () => {
      const newLabel = 'newLabel';
      tester.setAttribute(el, $.host._.ariaLabelIn, newLabel).subscribe();

      await assert(tester.getAttribute(el, $.host._.ariaLabelOut)).to.emitWith(newLabel);
    });

    should(`render the label if aria-label is not given`, async () => {
      const newLabel = 'newLabel';
      tester.setAttribute(el, $.host._.label, newLabel).subscribe();

      await assert(tester.getAttribute(el, $.host._.ariaLabelOut)).to.emitWith(newLabel);
    });
  });

  test('renderIconMode_', () => {
    should(`render disabled if disabled`, async () => {
      tester.setAttribute(el, $.host._.disabled, true).subscribe();

      await assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('disabled');
    });

    should(`render "action" if not disabled`, async () => {
      tester.setAttribute(el, $.host._.disabled, false).subscribe();

      await assert(tester.getAttribute(el, $.iconWithText._.mode)).to.emitWith('action');
    });
  });

  test('renderTabIndex_', () => {
    should(`render 0 if host is not disabled`, async () => {
      tester.setAttribute(el, $.host._.disabled, false).subscribe();
      await assert(tester.getAttribute(el, $.host._.tabindex)).to.emitWith(0);
    });

    should(`return -1 if host is disabled`, async () => {
      tester.setAttribute(el, $.host._.disabled, true).subscribe();
      await assert(tester.getAttribute(el, $.host._.tabindex)).to.emitWith(-1);
    });
  });
});
