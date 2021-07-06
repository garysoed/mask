import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {flattenNode, PersonaTesterFactory} from 'persona/export/testing';
import {of} from 'rxjs';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';

import goldenDefault from './goldens/text-input__default.html';
import goldenUpdate from './goldens/text-input__update.html';
import {TextInput} from './text-input';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/text-input', init => {
  setup(() => {
    runEnvironment(
        new BrowserSnapshotsEnv({
          default: goldenDefault,
          update: goldenUpdate,
        }),
    );
  });

  const _ = init(() => {
    const stateService = fakeStateService();
    const tester = testerFactory.build({
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $stateService, withValue: stateService},
      ],
      rootCtrls: [TextInput],
      rootDoc: document,
    });
    const {element, harness} = tester.createHarness(TextInput);

    const stateId = stateService.addRoot(mutableState('init state'));
    const $state = stateService.mutablePath(stateId);
    harness.host._.stateId($state);

    const labelEl = document.createElement('div');
    labelEl.textContent = 'Label';
    labelEl.setAttribute('slot', 'label');
    element.appendChild(labelEl);

    return {$state, element, harness, stateService, tester};
  });

  test('render', () => {
    should('render the value correctly', () => {
      _.harness.host._.clearFn([]);
      assert(flattenNode(_.element)).to.matchSnapshot('default');
    });
  });

  test('domValue$', () => {
    should('emit the correct value', () => {
      // Change the input and wait for the value to update.
      const value = 'value';

      _.harness.input._.onInput(value);
      _.harness.host._.applyFn([]);

      assert(_.stateService.$(_.$state)).to.emitWith(value);
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 'value';

      run(of(value).pipe(_.stateService.$(_.$state).set()));
      _.harness.host._.clearFn([]);

      assert(flattenNode(_.element)).to.matchSnapshot('update');
    });
  });
});
