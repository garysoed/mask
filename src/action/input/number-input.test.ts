import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {PersonaTesterFactory} from 'persona/export/testing';
import {of} from 'rxjs';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {NumberInput} from './number-input';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/number-input', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/input/goldens', goldens));

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

    const stateId = stateService.addRoot(mutableState(-2));
    const $state = stateService.mutablePath(stateId);
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

      assert(_.stateService.$(_.$state)).to.emitWith(value);
    });
  });

  test('hideStepperIcon', () => {
    should('show stepper icon when hovered', () => {
      _.harness.root._.onMouseEnter();

      assert(_.element).to.matchSnapshot('number-input__stepper');
    });

    should('hide stepper icon on mouseleave', () => {
      _.harness.root._.onMouseEnter();
      _.harness.root._.onMouseLeave();

      assert(_.element).to.matchSnapshot('number-input__hide-stepper');
    });
  });

  test('updateDomValue', () => {
    should('set the value correctly', () => {
      const value = 123;

      run(of(value).pipe(_.stateService.$(_.$state).set()));
      _.harness.host._.clearFn([]);

      assert(_.harness.input.selectable.value).to.equal(`${value}`);
    });
  });
});
