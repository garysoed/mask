import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {Context, DIV, oflag, query, registerCustomElement} from 'persona';

import {setupThemedTest} from '../testing/setup-themed-test';

import {$baseRootOutputs, BaseAction, create$baseAction} from './base-action';
import goldens from './goldens/goldens.json';

const $test = {
  host: {
    ...create$baseAction().host,
  },
  shadow: {
    div: query('#el', DIV, {
      ...$baseRootOutputs,
      disabled: oflag('disabled'),
    }),
  },
};

class TestAction extends BaseAction {
  constructor(private readonly $: Context<typeof $test>) {
    super($, $.shadow.div.disabled, $.shadow.div);
  }
}

const TEST = registerCustomElement({
  tag: 'mk-test-base-action',
  template: '<div id="el"></div>',
  ctrl: TestAction,
  spec: $test,
});

test('@mask/src/action/base-action', () => {
  const _ = setup(() => {
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
});
