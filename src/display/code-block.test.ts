import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {triggerFakeMutation} from 'persona/src/testing/fake-mutation-observer';

import {setupThemedTest} from '../testing/setup-themed-test';

import {CODE_BLOCK} from './code-block';
import goldens from './goldens/goldens.json';


test('@mask/src/display/code-block', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/display/goldens', goldens));
    const tester = setupThemedTest({roots: [CODE_BLOCK]});
    (window as any).hljs = {
      highlightBlock: () => undefined,
    };
    return {tester};
  });

  test('render', () => {
    should('render the content correctly', () => {
      const element = _.tester.createElement(CODE_BLOCK);
      element.textContent = `
      import {something} from './something.ts';

      something.callFn(123);
      `;
      triggerFakeMutation(element, {});

      assert(element).to.matchSnapshot('code-block.html');
    });
  });
});