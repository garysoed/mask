import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {getHarness, InputHarness} from 'persona/export/testing';
import {BehaviorSubject, ReplaySubject} from 'rxjs';

import {CHECKBOX, CheckedValue} from '../input/checkbox';
import {setupThemedTest} from '../testing/setup-themed-test';

import goldens from './goldens/goldens.json';
import {CheckboxHarness} from './testing/checkbox-harness';


test('@mask/src/input/checkbox', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/input/goldens', goldens));

    const tester = setupThemedTest({roots: [CHECKBOX]});

    return {tester};
  });

  test('render', () => {
    should('render default config correctly', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';

      assert(snapshotElement(element)).to.match('checkbox__default.golden');
    });

    should('render disabled checkbox correctly', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';
      element.setAttribute('mk-disabled', '');

      assert(snapshotElement(element)).to.match('checkbox__disabled.golden');
    });
  });

  test('checkMode$', () => {
    should('set the classlist to display_checked if checked', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';
      element.value = new BehaviorSubject<CheckedValue>(true);

      assert(snapshotElement(element)).to.match('checkbox__checked.golden');
    });

    should('set the classlist to display_unchecked if unchecked', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';
      element.value = new BehaviorSubject<CheckedValue>(false);

      assert(snapshotElement(element)).to.match('checkbox__unchecked.golden');
    });

    should('set the classlist to display_unknown if unknown', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';
      element.value = new BehaviorSubject<CheckedValue>(null);

      assert(snapshotElement(element)).to.match('checkbox__unknown.golden');
    });
  });

  test('domValue$', () => {
    should('react to change events', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';

      const harness = getHarness(element, CheckboxHarness);
      harness.simulateCheck();

      assert(snapshotElement(element)).to.match('checkbox__change-to-checked.golden');
      assert(element.value).to.emitWith(true);
    });
  });

  test('updateDomValue', () => {
    setup(_, () => {
      const value$ = new ReplaySubject<CheckedValue>(1);
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';
      element.value = value$;

      return {element, value$};
    });

    should('set update the DOM value correctly when checked', () => {
      _.value$.next(true);

      const inputEl = getHarness(_.element, '#input', InputHarness).target;
      assert(inputEl.indeterminate).to.beFalse();
      assert(inputEl.checked).to.beTrue();
    });

    should('set update the DOM value correctly when unchecked', () => {
      _.value$.next(false);

      const inputEl = getHarness(_.element, '#input', InputHarness).target;
      assert(inputEl.indeterminate).to.beFalse();
      assert(inputEl.checked).to.beFalse();
    });

    should('set unknown value correctly', () => {
      _.value$.next(null);

      const inputEl = getHarness(_.element, '#input', InputHarness).target;
      assert(inputEl.indeterminate).to.beTrue();
      assert(inputEl.checked).to.beFalse();
    });
  });
});
