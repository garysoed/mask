import {assert, createSpySubject, objectThat, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {getHarness, InputHarness} from 'persona/export/testing';
import {BehaviorSubject} from 'rxjs';

import {setupThemedTest} from '../testing/setup-themed-test';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {$onRadioInput$, OnRadioInput} from './on-radio-input';
import {RADIO_INPUT} from './radio-input';
import {RadioInputHarness} from './testing/radio-input-harness';


test('@mask/src/action/input/radio-input', () => {
  const KEY = 'key-3';
  const GROUP = 'test-group';

  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/input/goldens', goldens));

    const tester = setupThemedTest({
      roots: [RADIO_INPUT],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });

    return {tester};
  });

  test('render', () => {
    should('render default config correctly', () => {
      const element = _.tester.bootstrapElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('key', KEY);
      element.setAttribute('group', GROUP);

      assert(snapshotElement(element)).to.match('radio-input__default.golden');
    });
  });

  test('checkMode$', () => {
    should('set the icon to checked if checked', () => {
      const element = _.tester.bootstrapElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('key', KEY);
      element.setAttribute('group', GROUP);
      element.value.next(KEY);

      assert(snapshotElement(element)).to.match('radio-input__checked.golden');
    });

    should('set the icon to unchecked if unchecked', () => {
      const element = _.tester.bootstrapElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('key', KEY);
      element.setAttribute('group', GROUP);
      element.value.next(null);

      assert(snapshotElement(element)).to.match('radio-input__unchecked.golden');
    });

    should('set the icon to unchecked if the index doesn\'t match', () => {
      const element = _.tester.bootstrapElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('key', '6');
      element.setAttribute('group', GROUP);
      element.value.next(null);

      assert(snapshotElement(element)).to.match('radio-input__unmatched.golden');
    });
  });

  test('domValue$', () => {
    should('set the state correctly', () => {
      const value$ = new BehaviorSubject<string|null>(null);
      const element1 = _.tester.bootstrapElement(RADIO_INPUT);
      element1.textContent = 'Label';
      element1.setAttribute('key', '1');
      element1.setAttribute('group', GROUP);
      element1.value = value$;

      const element2 = _.tester.bootstrapElement(RADIO_INPUT);
      element2.textContent = 'Label';
      element2.setAttribute('key', '2');
      element2.setAttribute('group', GROUP);
      element2.value = value$;

      const element3 = _.tester.bootstrapElement(RADIO_INPUT);
      element3.textContent = 'Label';
      element3.setAttribute('key', '3');
      element3.setAttribute('group', GROUP);
      element3.value = value$;

      const rootEl = document.createElement('div');
      rootEl.appendChild(element1);
      rootEl.appendChild(element2);
      rootEl.appendChild(element3);

      // Change the third element.
      getHarness(element3, 'input', InputHarness).simulateChange(el => {
        el.checked = true;
      });

      assert(value$).to.emitWith('3');

      // Then the second one.
      getHarness(element2, 'input', InputHarness).simulateChange(el => {
        el.checked = true;
      });

      assert(value$).to.emitWith('2');

      // Click on the third one again.
      getHarness(element3, 'input', InputHarness).simulateChange(el => {
        el.checked = true;
      });

      assert(value$).to.emitWith('3');
    });
  });

  test('handleOnGlobalRadioInput$', _, () => {
    should('reset the dom value if global radio input emits for other index and the ID match', () => {
      const element = _.tester.bootstrapElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('key', KEY);
      element.setAttribute('group', GROUP);
      element.value.next(KEY);

      $onRadioInput$.get(_.tester.vine).next({key: '1', group: GROUP});

      assert(snapshotElement(element)).to.match('radio-input__global-other-index.golden');
    });

    should('do nothing if the global radio input emits for the current index', () => {
      const element = _.tester.bootstrapElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('key', KEY);
      element.setAttribute('group', GROUP);
      element.value.next(KEY);

      $onRadioInput$.get(_.tester.vine).next({key: KEY, group: GROUP});

      assert(snapshotElement(element)).to.match('radio-input__global-same-index.golden');
    });

    should('do nothing if the global radio input emits and the namespace doesn\'t match', () => {
      const element = _.tester.bootstrapElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('key', KEY);
      element.setAttribute('group', GROUP);
      element.value.next(KEY);

      $onRadioInput$.get(_.tester.vine).next({key: '1', group: 'other'});

      assert(snapshotElement(element)).to.match('radio-input__global-unmatch-namespace.golden');
    });
  });

  test('handleOnRadioInput$', () => {
    should('emit the global radio input', () => {
      const element = _.tester.bootstrapElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('key', KEY);
      element.setAttribute('group', GROUP);

      const onRadioInput$ = createSpySubject($onRadioInput$.get(_.tester.vine));

      getHarness(element, RadioInputHarness).simulateCheck();

      assert(onRadioInput$).to.emitWith(objectThat<OnRadioInput>().haveProperties({
        key: KEY,
        group: GROUP,
      }));
    });

    should('do nothing if the value is null', () => {
      const element = _.tester.bootstrapElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('key', KEY);
      element.setAttribute('group', GROUP);

      const onRadioInput$ = createSpySubject($onRadioInput$.get(_.tester.vine));

      getHarness(element, RadioInputHarness).simulateUncheck();

      assert(onRadioInput$).toNot.emit();
    });
  });
});
