import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';

import hideStepper from './goldens/number-input__hide_stepper.html';
import stepper from './goldens/number-input__stepper.html';
import {$, NumberInput} from './number-input';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/number-input', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({hideStepper, stepper}));

    const stateService = fakeStateService();
    const tester = testerFactory.build({
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $stateService, withValue: stateService},
      ],
      rootCtrls: [NumberInput],
      rootDoc: document,
    });
    const el = tester.createElement(NumberInput);

    const $state = stateService.modify(x => x.add(-2));
    el.setAttribute($.host._.stateId, $state);

    const labelEl = document.createElement('div');
    labelEl.textContent = 'Label';
    el.element.appendChild(labelEl);

    return {$state, el, stateService, tester};
  });

  test('domValue$', () => {
    should('emit the correct value', () => {
      // Change the input and wait for the value to update.
      const value = 123;
      _.el.setInputValue($.input, `${value}`);

      _.el.dispatchEvent($.input._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.resolve(_.$state)).to.emitWith(value);
    });
  });

  test('hideStepperIcon', () => {
    should('show stepper icon when hovered', () => {
      _.el.dispatchEvent($.root._.onMouseEnter);

      assert(_.el.flattenContent()).to.matchSnapshot('stepper');
    });

    should('hide stepper icon on mouseleave', () => {
      _.el.dispatchEvent($.root._.onMouseEnter);
      _.el.dispatchEvent($.root._.onMouseLeave);

      assert(_.el.flattenContent()).to.matchSnapshot('hideStepper');
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 123;

      _.stateService.modify(x => x.set(_.$state, value));
      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.input).value).to.equal(`${value}`);
    });
  });
});
