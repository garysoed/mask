import {$stateService} from 'grapevine';
import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';

import goldenDefault from './goldens/text-input__default.html';
import goldenUpdate from './goldens/text-input__update.html';
import {$, TextInput} from './text-input';


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
    const el = tester.createElement(TextInput);

    const $state = stateService.modify(x => x.add('init state'));
    el.setAttribute($.host._.stateId, $state);

    const labelEl = document.createElement('div');
    labelEl.textContent = 'Label';
    labelEl.setAttribute('slot', 'label');
    el.element.appendChild(labelEl);

    return {$state, el, stateService, tester};
  });

  test('render', () => {
    should('render the value correctly', () => {
      _.el.callFunction($.host._.clearFn, []);
      assert(_.el.flattenContent()).to.matchSnapshot('default');
    });
  });

  test('domValue$', () => {
    should('emit the correct value', () => {
      // Change the input and wait for the value to update.
      const value = 'value';
      _.el.setInputValue($.input, value);

      _.el.dispatchEvent($.input._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.resolve(_.$state)).to.emitWith(value);
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 'value';

      _.stateService.modify(x => x.set(_.$state, value));
      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.flattenContent()).to.matchSnapshot('update');
    });
  });
});
