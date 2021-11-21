import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, setThat, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {flattenNode, PersonaTesterFactory} from 'persona/export/testing';
import {of} from 'rxjs';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';
import {Checkbox, CheckedValue} from '../input/checkbox';

import goldens from './goldens/goldens.json';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/checkbox', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/action/input/goldens', goldens));

    const stateService = fakeStateService();
    const tester = testerFactory.build({
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $stateService, withValue: stateService},
      ],
      rootCtrls: [Checkbox],
      rootDoc: document,
    });

    const {element, harness} = tester.createHarness(Checkbox);
    const stateId = stateService.addRoot(mutableState<CheckedValue>(true));
    const $state = stateService.mutablePath(stateId);
    harness.host._.stateId($state);

    return {element, harness, $state, stateService};
  });

  test('render', () => {
    should('render default config correctly', () => {
      _.harness.host._.label('label');

      assert(flattenNode(_.element)).to.matchSnapshot('checkbox__default');
    });
  });

  test('checkMode$', () => {
    setup(() => {
      _.harness.host._.label('label');
    });

    should('set the classlist to display_checked if checked', () => {
      const el = _.harness.checkbox.selectable;
      el.indeterminate = false;
      el.checked = true;
      _.harness.checkbox._.onInput('');

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_checked'])));
      assert(flattenNode(_.element)).to.matchSnapshot('checkbox__checked');
    });

    should('set the classlist to display_unchecked if unchecked', () => {
      const el = _.harness.checkbox.selectable;
      el.indeterminate = false;
      el.checked = false;
      _.harness.checkbox._.onInput('');

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_unchecked'])));
      assert(flattenNode(_.element)).to.matchSnapshot('checkbox__unchecked');
    });

    should('set the classlist to display_unknown if unknown', () => {
      const el = _.harness.checkbox.selectable;
      el.indeterminate = true;
      el.checked = true;
      _.harness.checkbox._.onInput('');

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_unknown'])));
      assert(flattenNode(_.element)).to.matchSnapshot('checkbox__unknown');
    });

    should('update the slot name if the value is set by calling clear', () => {
      run(of(true).pipe(_.stateService.$(_.$state).set()));
      _.harness.host._.clearFn([]);

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_checked'])));
      assert(flattenNode(_.element)).to.matchSnapshot('checkbox__update');
    });
  });

  test('domValue$', () => {
    should('emit true if the checked', () => {
      const el = _.harness.checkbox.selectable;
      el.indeterminate = false;
      el.checked = true;
      _.harness.checkbox._.onInput('');
      _.harness.host._.applyFn([]);

      assert(_.stateService.$(_.$state)).to.emitWith(true);
    });

    should('emit false if the unchecked', () => {
      const el = _.harness.checkbox.selectable;
      el.indeterminate = false;
      el.checked = false;
      _.harness.checkbox._.onInput('');
      _.harness.host._.applyFn([]);

      assert(_.stateService.$(_.$state)).to.emitWith(false);
    });

    should('emit unknown if the value is indeterminate', () => {
      const el = _.harness.checkbox.selectable;
      el.indeterminate = true;
      el.checked = true;
      _.harness.checkbox._.onInput('');
      _.harness.host._.applyFn([]);

      assert(_.stateService.$(_.$state)).to.emitWith('unknown');
    });
  });

  test('updateDomValue', () => {
    should('set true value correctly', () => {
      run(of(true).pipe(_.stateService.$(_.$state).set()));

      _.harness.host._.clearFn([]);

      assert(_.harness.checkbox.selectable.checked).to.equal(true);
      assert(_.harness.checkbox.selectable.indeterminate).to.equal(false);
    });

    should('set false value correctly', () => {
      run(of(false).pipe(_.stateService.$(_.$state).set()));

      _.harness.host._.clearFn([]);

      assert(_.harness.checkbox.selectable.checked).to.equal(false);
      assert(_.harness.checkbox.selectable.indeterminate).to.equal(false);
    });

    should('set unknown value correctly', () => {
      run(of<CheckedValue>('unknown').pipe(_.stateService.$(_.$state).set()));

      _.harness.host._.clearFn([]);

      assert(_.harness.checkbox.selectable.checked).to.equal(false);
      assert(_.harness.checkbox.selectable.indeterminate).to.equal(true);
    });
  });
});
