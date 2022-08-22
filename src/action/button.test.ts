import {anyThat, assert, createSpySubject, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getHarness} from 'persona/export/testing';
import {fromEvent} from 'rxjs';

import {ActionEvent} from '../event/action-event';
import {setupThemedTest} from '../testing/setup-themed-test';

import {BUTTON} from './button';
import goldens from './goldens/goldens.json';
import {ButtonHarness} from './testing/button-harness';


test('@mask/src/action/button', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/goldens', goldens));
    const tester = setupThemedTest({roots: [BUTTON]});

    return {tester};
  });

  should('render disabled button correctly', () => {
    const element = _.tester.bootstrapElement(BUTTON);
    element.textContent = 'Button';
    element.setAttribute('mk-disabled', '');

    assert(element).to.matchSnapshot('button__disabled.html');
  });

  test('onAction$', () => {
    setup(_, () => {
      const element = _.tester.bootstrapElement(BUTTON);
      const harness = getHarness(element, ButtonHarness);
      const onAction$ = createSpySubject(fromEvent(element, 'mk-action'));
      return {..._, element, onAction$, harness};
    });

    should('fire the action event if clicked', () => {
      _.harness.simulateClick();
      assert(_.onAction$).to.emitSequence([
        anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent),
      ]);
    });

    should('fire the action event on pressing Enter', () => {
      _.harness.simulateEnter();
      assert(_.onAction$).to
          .emitSequence([anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent)]);
    });

    should('fire the action event on pressing space', () => {
      _.harness.simulateEnter();
      assert(_.onAction$).to
          .emitSequence([anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent)]);
    });

    should('not fire the action event if disabled', () => {
      _.element.setAttribute('mk-disabled', '');

      _.harness.simulateClick();
      assert(_.onAction$).toNot.emit();
    });
  });

  test('renderTabIndex', () => {
    should('render 0 if host is not disabled', () => {
      const element = _.tester.bootstrapElement(BUTTON);
      element.textContent = 'Button';

      assert(element).to.matchSnapshot('button__enabled.html');
    });
  });
});
