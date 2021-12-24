import {anyThat, assert, createSpySubject, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getEl} from 'persona/export/testing';
import {fromEvent} from 'rxjs';

import {ActionEvent} from '../event/action-event';
import {setupThemedTest} from '../testing/setup-themed-test';

import {BUTTON} from './button';
import goldens from './goldens/goldens.json';


test('@mask/src/action/button', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/action/goldens', goldens));
    const tester = setupThemedTest({roots: [BUTTON]});

    return {tester};
  });

  should('render disabled button correctly', () => {
    const element = _.tester.createElement(BUTTON);
    element.textContent = 'Button';
    element.setAttribute('mk-disabled', '');

    assert(element).to.matchSnapshot('button__disabled.html');
  });

  test('onAction$', _, init => {
    const _ = init(_ => {
      const element = _.tester.createElement(BUTTON);
      const root = getEl(element, 'root')!;
      const onAction$ = createSpySubject(fromEvent(element, 'mk-action'));
      return {..._, element, onAction$, root};
    });

    should('fire the action event if clicked', () => {
      _.root.simulateClick();
      assert(_.onAction$).to.emitSequence([
        anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent),
      ]);
    });

    should('fire the action event on pressing Enter', () => {
      _.root.simulateKeydown('Enter');
      assert(_.onAction$).to
          .emitSequence([anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent)]);
    });

    should('fire the action event on pressing space', () => {
      _.root.simulateKeydown(' ');
      assert(_.onAction$).to
          .emitSequence([anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent)]);
    });

    should('not fire the action event if disabled', () => {
      _.element.setAttribute('mk-disabled', '');

      _.root.simulateClick();
      assert(_.onAction$).toNot.emit();
    });
  });

  test('renderTabIndex', () => {
    should('render 0 if host is not disabled', () => {
      const element = _.tester.createElement(BUTTON);
      element.textContent = 'Button';

      assert(element).to.matchSnapshot('button__enabled.html');
    });
  });
});
