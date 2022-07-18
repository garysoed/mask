import {source} from 'grapevine';
import {assert, createSpySubject, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {Context, DIV, query, oflag, registerCustomElement} from 'persona';
import {fromEvent, Observable, Subject} from 'rxjs';

import {ActionEvent, ACTION_EVENT} from '../event/action-event';
import {setupThemedTest} from '../testing/setup-themed-test';

import {$baseRootOutputs, BaseAction, create$baseAction} from './base-action';
import goldens from './goldens/goldens.json';

const $trigger = source(() => new Subject<ActionEvent<number>>());

const $test = {
  host: {
    ...create$baseAction<number>().host,
  },
  shadow: {
    div: query('#el', DIV, {
      ...$baseRootOutputs,
      disabled: oflag('disabled'),
    }),
  },
};

class TestAction extends BaseAction<number> {
  constructor(private readonly $: Context<typeof $test>) {
    super($, $.shadow.div.disabled, $.shadow.div);
  }

  get onAction$(): Observable<ActionEvent<number>> {
    return $trigger.get(this.$.vine);
  }
}

const TEST = registerCustomElement({
  tag: 'mk-test-base-action',
  template: '<div id="el"></div>',
  ctrl: TestAction,
  spec: $test,
});

test('@mask/src/action/base-action', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/goldens', goldens));
    const tester = setupThemedTest({roots: [TEST]});
    return {tester};
  });

  should('render disabled correctly', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.setAttribute('mk-disabled', '');

    assert(element).to.matchSnapshot('base-action__aria_disabled_true.html');

    element.removeAttribute('mk-disabled');

    assert(element).to.matchSnapshot('base-action__aria_disabled_false.html');
  });

  test('isSecondary', () => {
    should('render mk-action-1 if primary', () => {
      const element = _.tester.bootstrapElement(TEST);

      assert(element).to.matchSnapshot('base-action__is-secondary_false.html');
    });

    should('render mk-action-2 if secondary', () => {
      const element = _.tester.bootstrapElement(TEST);

      element.setAttribute('is-secondary', '');
      assert(element).to.matchSnapshot('base-action__is-secondary_true.html');
    });
  });

  test('action', () => {
    should('emit the event correctly', () => {
      const element = _.tester.bootstrapElement(TEST);
      const event$ = createSpySubject(fromEvent(element, ACTION_EVENT));
      const event = new ActionEvent(123);
      $trigger.get(_.tester.vine).next(event);

      assert(event$).to.emitSequence([event]);
    });
  });
});
