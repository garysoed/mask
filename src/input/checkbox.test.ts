import {assert, createSpySubject, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getHarness, InputHarness} from 'persona/export/testing';
import {BehaviorSubject, fromEvent, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActionEvent, ACTION_EVENT} from '../event/action-event';
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

      assert(element).to.matchSnapshot('checkbox__default.html');
    });

    should('render disabled checkbox correctly', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';
      element.setAttribute('mk-disabled', '');

      assert(element).to.matchSnapshot('checkbox__disabled.html');
    });
  });

  test('checkMode$', () => {
    should('set the classlist to display_checked if checked', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';
      element.value = new BehaviorSubject<CheckedValue>(true);

      assert(element).to.matchSnapshot('checkbox__checked.html');
    });

    should('set the classlist to display_unchecked if unchecked', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';
      element.value = new BehaviorSubject<CheckedValue>(false);

      assert(element).to.matchSnapshot('checkbox__unchecked.html');
    });

    should('set the classlist to display_unknown if unknown', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';
      element.value = new BehaviorSubject<CheckedValue>(null);

      assert(element).to.matchSnapshot('checkbox__unknown.html');
    });
  });

  test('onAction$', () => {
    should('emit the action on value change', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';

      const event$ = createSpySubject(
          fromEvent<ActionEvent<CheckedValue>>(element, ACTION_EVENT).pipe(
              map(event => event.payload),
          ),
      );

      const harness = getHarness(element, CheckboxHarness);
      harness.simulateCheck();

      assert(event$).to.emitSequence([true]);
    });

    should('not emit if the value does not change', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';

      const event$ = createSpySubject(
          fromEvent<ActionEvent<CheckedValue>>(element, ACTION_EVENT).pipe(
              map(event => event.payload),
          ),
      );

      const harness = getHarness(element, CheckboxHarness);
      harness.simulateCheck();
      harness.simulateCheck();

      assert(event$).to.emitSequence([true]);
    });
  });

  test('domValue$', () => {
    should('react to change events', () => {
      const element = _.tester.bootstrapElement(CHECKBOX);
      element.textContent = 'Label';

      const event$ = createSpySubject(
          fromEvent<ActionEvent<CheckedValue>>(element, ACTION_EVENT).pipe(
              map(event => event.payload),
          ),
      );

      const harness = getHarness(element, CheckboxHarness);
      harness.simulateCheck();

      assert(element).to.matchSnapshot('checkbox__change-to-checked.html');
      assert(element.value).to.emitWith(true);
      assert(event$).to.emitSequence([true]);
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
