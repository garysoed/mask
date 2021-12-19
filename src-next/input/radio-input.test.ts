import {assert, createSpySubject, objectThat, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getEl} from 'persona/export/testing';

import {setupThemedTest} from '../testing/setup-themed-test';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {$onRadioInput$, OnRadioInput} from './on-radio-input';
import {RADIO_INPUT} from './radio-input';


test('@mask/src/action/input/radio-input', init => {
  const INDEX = 3;
  const NAMESPACE = 'test-namespace';

  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/input/goldens', goldens));

    const tester = setupThemedTest({
      roots: [RADIO_INPUT],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });

    return {tester};
  });

  test('render', () => {
    should('render default config correctly', () => {
      const element = _.tester.createElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('index', `${INDEX}`);
      element.setAttribute('namespace', NAMESPACE);

      assert(element).to.matchSnapshot('radio-input__default.html');
    });
  });

  test('checkMode$', () => {
    should('set the slot to display_checked if checked', () => {
      const element = _.tester.createElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('index', `${INDEX}`);
      element.setAttribute('namespace', NAMESPACE);
      element.initValue = INDEX;
      element.clearFn(undefined);

      assert(element).to.matchSnapshot('radio-input__checked.html');
    });

    should('set the slot to display_unchecked if unchecked', () => {
      const element = _.tester.createElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('index', `${INDEX}`);
      element.setAttribute('namespace', NAMESPACE);
      element.initValue = null;
      element.clearFn(undefined);

      assert(element).to.matchSnapshot('radio-input__unchecked.html');
    });
  });

  test('domValue$', () => {
    should('set the state correctly', () => {
      const element1 = _.tester.createElement(RADIO_INPUT);
      element1.textContent = 'Label';
      element1.setAttribute('index', '1');
      element1.setAttribute('namespace', NAMESPACE);

      const element2 = _.tester.createElement(RADIO_INPUT);
      element2.textContent = 'Label';
      element2.setAttribute('index', '2');
      element2.setAttribute('namespace', NAMESPACE);

      const element3 = _.tester.createElement(RADIO_INPUT);
      element3.textContent = 'Label';
      element3.setAttribute('index', '3');
      element3.setAttribute('namespace', NAMESPACE);

      // Change the third element.
      getEl(element3, 'input')!.simulateChange(el => {
        el.checked = true;
      });

      assert(element1.value).to.beNull();
      assert(element2.value).to.beNull();
      assert(element3.value).to.equal(3);

      // Then the second one.
      getEl(element2, 'input')!.simulateChange(el => {
        el.checked = true;
      });

      assert(element1.value).to.beNull();
      assert(element2.value).to.equal(2);
      assert(element3.value).to.beNull();

      // Click on the third one again.
      getEl(element3, 'input')!.simulateChange(el => {
        el.checked = true;
      });

      assert(element1.value).to.beNull();
      assert(element2.value).to.beNull();
      assert(element3.value).to.equal(3);
    });
  });

  test('handleOnGlobalRadioInput$', _, () => {
    should('reset the dom value if global radio input emits for other index and the ID match', () => {
      const element = _.tester.createElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('index', `${INDEX}`);
      element.setAttribute('namespace', NAMESPACE);
      element.initValue = INDEX;
      element.clearFn(undefined);

      $onRadioInput$.get(_.tester.vine).next({index: 1, namespace: NAMESPACE});

      assert(element).to.matchSnapshot('radio-input__global-other-index.html');
    });

    should('do nothing if the global radio input emits for the current index', () => {
      const element = _.tester.createElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('index', `${INDEX}`);
      element.setAttribute('namespace', NAMESPACE);
      element.initValue = INDEX;
      element.clearFn(undefined);

      $onRadioInput$.get(_.tester.vine).next({index: INDEX, namespace: NAMESPACE});

      assert(element).to.matchSnapshot('radio-input__global-same-index.html');
    });

    should('do nothing if the global radio input emits and the namespace doesn\'t match', () => {
      const element = _.tester.createElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('index', `${INDEX}`);
      element.setAttribute('namespace', NAMESPACE);
      element.initValue = INDEX;
      element.clearFn(undefined);

      $onRadioInput$.get(_.tester.vine).next({index: 1, namespace: 'other'});

      assert(element).to.matchSnapshot('radio-input__global-unmatch-namespace.html');
    });
  });

  test('handleOnRadioInput$', () => {
    should('emit the global radio input', () => {
      const element = _.tester.createElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('index', `${INDEX}`);
      element.setAttribute('namespace', NAMESPACE);

      const onRadioInput$ = createSpySubject($onRadioInput$.get(_.tester.vine));

      getEl(element, 'input')!.simulateChange(el => {
        el.checked = true;
      });

      assert(onRadioInput$).to.emitWith(objectThat<OnRadioInput>().haveProperties({
        index: INDEX,
        namespace: NAMESPACE,
      }));
    });

    should('do nothing if the value is null', () => {
      const element = _.tester.createElement(RADIO_INPUT);
      element.textContent = 'Label';
      element.setAttribute('index', `${INDEX}`);
      element.setAttribute('namespace', NAMESPACE);

      const onRadioInput$ = createSpySubject($onRadioInput$.get(_.tester.vine));

      getEl(element, 'input')!.simulateChange(el => {
        el.checked = false;
      });

      assert(onRadioInput$).toNot.emit();
    });
  });
});
