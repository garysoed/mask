import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {triggerFakeMutation} from 'persona/export/testing';

import {setupThemedTest} from '../testing/setup-themed-test';

import {CODE_BLOCK} from './code-block';
import goldens from './goldens/goldens.json';


test('@mask/src/display/code-block', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/display/goldens', goldens));
    const tester = setupThemedTest({roots: [CODE_BLOCK]});
    (window as any).hljs = {
      highlightBlock: () => undefined,
    };
    return {tester};
  });

  test('render', () => {
    should('render the content correctly', () => {
      const element = _.tester.bootstrapElement(CODE_BLOCK);
      element.textContent = `
      import {something} from './something.ts';

      something.callFn(123);
      `;
      triggerFakeMutation(element, {});

      assert(snapshotElement(element)).to.match('code-block.golden');
    });
  });
});