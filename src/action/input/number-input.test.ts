import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {flattenNode, PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';

import hideStepper from './goldens/number-input__hide_stepper.html';
import stepper from './goldens/number-input__stepper.html';
import {NumberInput} from './number-input';


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
    const {element, harness} = tester.createHarness(NumberInput);

    const $state = stateService.modify(x => x.add(-2));
    harness.host._.stateId($state);

    const labelEl = document.createElement('div');
    labelEl.textContent = 'Label';
    element.appendChild(labelEl);

    return {$state, element, harness, stateService, tester};
  });

  test('domValue$', () => {
    should('emit the correct value', () => {
      // Change the input and wait for the value to update.
      const value = 123;
      _.harness.input._.onInput(`${value}`);
      _.harness.host._.applyFn([]);

      assert(_.stateService.resolve(_.$state)).to.emitWith(value);
    });
  });

  test('hideStepperIcon', () => {
    should('show stepper icon when hovered', () => {
      _.harness.root._.onMouseEnter();

      assert(flattenNode(_.element)).to.matchSnapshot('stepper');
    });

    should('hide stepper icon on mouseleave', () => {
      _.harness.root._.onMouseEnter();
      _.harness.root._.onMouseLeave();

      assert(flattenNode(_.element)).to.matchSnapshot('hideStepper');
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 123;

      _.stateService.modify(x => x.set(_.$state, value));
      _.harness.host._.clearFn([]);

      assert(_.harness.input.selectable.value).to.equal(`${value}`);
    });
  });
});
