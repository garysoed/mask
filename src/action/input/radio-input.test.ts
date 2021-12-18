import {$stateService} from 'grapevine';
import {assert, createSpySubject, objectThat, run, runEnvironment, setThat, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService, immutablePathOf, mutableState, ObjectPath} from 'gs-tools/export/state';
import {PersonaTesterFactory} from 'persona/export/testing';
import {of} from 'rxjs';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {$onRadioInput$, OnRadioInput} from './on-radio-input';
import {RadioInput} from './radio-input';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/action/input/radio-input', init => {
  const INDEX = 3;

  const _ = init(() => {
    runEnvironment(
        new BrowserSnapshotsEnv('src/action/input/goldens', goldens),
    );

    const stateService = fakeStateService();
    const tester = testerFactory.build({
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $stateService, withValue: stateService},
      ],
      rootCtrls: [RadioInput],
      rootDoc: document,
    });
    const {element, harness} = tester.createHarness(RadioInput);

    const stateId = stateService.addRoot(mutableState<number|null>(null));
    const $state = stateService.mutablePath(stateId);
    harness.host._.stateId($state);
    harness.host._.index(INDEX);

    return {$state, element, harness, stateService, tester};
  });

  test('render', () => {
    should('render default config correctly', () => {
      _.harness.host._.label('label');

      assert(_.element).to.matchSnapshot('radio-input__default');
    });
  });

  test('checkMode$', () => {
    should('set the slot to display_checked if checked', () => {
      const el = _.harness.input.selectable;
      el.checked = true;
      _.harness.host._.label('label');
      _.harness.input._.onInput('');

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_checked'])));
      assert(_.element).to.matchSnapshot('radio-input__checked');
    });

    should('set the slot to display_unchecked if unchecked', () => {
      const el = _.harness.input.selectable;
      el.checked = false;
      _.harness.host._.label('label');
      _.harness.input._.onInput('');

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_unchecked'])));
      assert(_.element).to.matchSnapshot('radio-input__unchecked');
    });
  });

  test('domValue$', () => {
    should('set the state correctly', () => {
      const {harness: harness1} = _.tester.createHarness(RadioInput);
      harness1.host._.stateId(_.$state);
      harness1.host._.index(1);

      const {harness: harness2} = _.tester.createHarness(RadioInput);
      harness2.host._.stateId(_.$state);
      harness2.host._.index(2);

      const state$ = createSpySubject(_.stateService.$(_.$state));

      // Click on the third one.
      _.harness.input.selectable.checked = true;
      _.harness.input._.onInput('');

      // Then the second one.
      harness2.input.selectable.checked = true;
      harness2.input._.onInput('');

      // Click on the third one again.
      _.harness.input.selectable.checked = true;
      _.harness.input._.onInput('');

      assert(state$).to.emitSequence([null, 3, 2, 3]);
    });
  });

  test('handleOnGlobalRadioInput$', _, init => {
    const _ = init(_ => {
      // Check the element.
      _.harness.input.selectable.checked = true;
      _.harness.input._.onInput('');

      return _;
    });

    should('reset the dom value if global radio input emits for other index and the ID match', () => {
      $onRadioInput$.get(_.tester.vine).next({index: 1, stateId: immutablePathOf(_.$state)});

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_unchecked'])));
    });

    should('do nothing if the global radio input emits for the current index', () => {
      $onRadioInput$.get(_.tester.vine).next({index: INDEX, stateId: immutablePathOf(_.$state)});

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_checked'])));
    });

    should('do nothing if the global radio input emits and the ID doesn\'t match', () => {
      const otherStateId = _.stateService.addRoot(mutableState<number|null>(null));
      $onRadioInput$.get(_.tester.vine).next({
        index: INDEX,
        stateId: immutablePathOf(_.stateService.mutablePath(otherStateId)),
      });

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_checked'])));
    });
  });

  test('handleOnRadioInput$', () => {
    should('emit the global radio input', () => {
      const onRadioInput$ = createSpySubject($onRadioInput$.get(_.tester.vine));

      // Check the element.
      _.harness.input.selectable.checked = true;
      _.harness.input._.onInput('');

      assert(onRadioInput$).to.emitWith(objectThat<OnRadioInput>().haveProperties({
        index: INDEX,
        stateId: objectThat<ObjectPath<number|null>>().haveProperties({
          id: immutablePathOf(_.$state).id,
        }),
      }));
    });

    should('do nothing if the value is null', () => {
      const onRadioInput$ = createSpySubject($onRadioInput$.get(_.tester.vine));

      // Check the element.
      _.harness.input.selectable.checked = false;
      _.harness.input._.onInput('');

      assert(onRadioInput$).toNot.emit();
    });
  });

  test('nullableDomValue$', () => {
    should('emit the index if element is checked', () => {
      // Set the state to some number.
      run(of(123).pipe(_.stateService.$(_.$state).set()));

      _.harness.input.selectable.checked = true;
      _.harness.input._.onInput('');
      _.harness.host._.applyFn([]);

      assert(_.stateService.$(_.$state)).to.emitWith(INDEX);
    });

    should('emit null if element is unchecked', () => {
      const value = 123;
      // Set the state to some number.
      run(of(value).pipe(_.stateService.$(_.$state).set()));

      _.harness.input.selectable.checked = false;
      _.harness.input._.onInput('');
      _.harness.host._.applyFn([]);

      assert(_.stateService.$(_.$state)).to.emitWith(null);
    });
  });

  test('updateDomValue', () => {
    should('check the element if new value is the same as the index', () => {
      run(of(INDEX).pipe(_.stateService.$(_.$state).set()));

      _.harness.host._.clearFn([]);

      assert(_.harness.input.selectable.checked).to.equal(true);
    });

    should('uncheck the element if the new value is different from the index', () => {
      run(of(1).pipe(_.stateService.$(_.$state).set()));

      _.harness.host._.clearFn([]);

      assert(_.harness.input.selectable.checked).to.equal(false);
    });
  });
});
