import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {Context, DIV, id, registerCustomElement} from 'persona';
import {flattenNode, setupTest} from 'persona/export/testing';
import {oflag} from 'persona/src-next/output/flag';

import {$baseAction as $$baseAction, $baseRootOutputs, BaseAction} from './base-action';
import goldens from './goldens/goldens.json';


const $test = {
  host: {
    ...$$baseAction.host,
  },
  shadow: {
    div: id('el', DIV, {
      ...$baseRootOutputs,
      disabled: oflag('disabled'),
    }),
  },
};

class TestAction extends BaseAction {
  constructor($: Context<typeof $test>) {
    super($, $.shadow.div.disabled, $.shadow.div);
  }
}

const TEST = registerCustomElement({
  tag: 'mk-test-base-action',
  template: '<div id="el"></div>',
  ctrl: TestAction,
  spec: $test,
});

test('@mask/action/base-action', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/action/goldens', goldens));
    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  test('ariaDisabled$', () => {
    should('set the aria value correctly', () => {
      const element = _.tester.createElement(TEST);
      element.setAttribute('disabled', '');

      assert(flattenNode(element)).to.matchSnapshot('base-action__aria_disabled_true.html');

      element.removeAttribute('disabled');

      assert(flattenNode(element)).to.matchSnapshot('base-action__aria_disabled_false.html');
    });
  });

  test('isSecondary', () => {
    should('render mk-action-1 if primary', () => {
      const element = _.tester.createElement(TEST);

      assert(flattenNode(element)).to.matchSnapshot('base-action__is-secondary_false.html');
    });

    should('render mk-action-2 if secondary', () => {
      const element = _.tester.createElement(TEST);

      element.setAttribute('is-secondary', '');
      assert(flattenNode(element)).to.matchSnapshot('base-action__is-secondary_true.html');
    });
  });
});
