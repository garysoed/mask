import {$stateService} from 'grapevine';
import {assert, createSpySubject, objectThat, runEnvironment, setThat, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {flattenNode, PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';

import goldenChecked from './goldens/radio-input__checked.html';
import goldenDefault from './goldens/radio-input__default.html';
import goldenUnchecked from './goldens/radio-input__unchecked.html';
import {$onRadioInput$, OnRadioInput} from './on-radio-input';
import {RadioInput} from './radio-input';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/action/input/radio-input', init => {
  const INDEX = 3;

  const _ = init(() => {
    runEnvironment(
        new BrowserSnapshotsEnv({
          render: goldenDefault,
          checked: goldenChecked,
          unchecked: goldenUnchecked,
        }),
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

    const $state = stateService.modify(x => x.add<number|null>(null));
    harness.host._.stateId($state);
    harness.host._.index(INDEX);

    return {$state, element, harness, stateService, tester};
  });

  test('render', () => {
    should('render default config correctly', () => {
      _.harness.host._.label('label');

      assert(flattenNode(_.element)).to.matchSnapshot('render');
    });
  });

  test('checkMode$', () => {
    should('set the slot to display_checked if checked', () => {
      const el = _.harness.input.selectable;
      el.checked = true;
      _.harness.host._.label('label');
      _.harness.input._.onInput('');

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_checked'])));
      assert(flattenNode(_.element)).to.matchSnapshot('checked');
    });

    should('set the slot to display_unchecked if unchecked', () => {
      const el = _.harness.input.selectable;
      el.checked = false;
      _.harness.host._.label('label');
      _.harness.input._.onInput('');

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_unchecked'])));
      assert(flattenNode(_.element)).to.matchSnapshot('unchecked');
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

      const state$ = createSpySubject(_.stateService.resolve(_.$state));

      // Click on the third one.
      const el = _.harness.input.selectable;
      el.checked = true;
      _.harness.input._.onInput('');
      _.harness.host._.applyFn([]);

      // Then the second one.
      harness2.input.selectable.checked = true;
      harness2.input._.onInput('');
      harness2.host._.applyFn([]);

      // Click on the third one again.
      _.harness.input.selectable.checked = true;
      _.harness.input._.onInput('');
      _.harness.host._.applyFn([]);

      assert(state$).to.emitSequence([null, 3, 2, 3]);
    });

    should('set the state correctly', () => {
      const {harness: harness1} = _.tester.createHarness(RadioInput);
      harness1.host._.stateId(_.$state);
      harness1.host._.index(1);

      const {harness: harness2} = _.tester.createHarness(RadioInput);
      harness2.host._.stateId(_.$state);
      harness2.host._.index(2);

      const state$ = createSpySubject(_.stateService.resolve(_.$state));

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
      $onRadioInput$.get(_.tester.vine).next({index: 1, stateId: _.$state});

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_unchecked'])));
    });

    should('do nothing if the global radio input emits for the current index', () => {
      $onRadioInput$.get(_.tester.vine).next({index: INDEX, stateId: _.$state});

      assert(_.harness.container._.checkMode).to.emitWith(setThat<string>().haveExactElements(new Set(['display_checked'])));
    });

    should('do nothing if the global radio input emits and the ID doesn\'t match', () => {
      const $otherStateId = _.stateService.modify(x => x.add<number|null>(null));
      $onRadioInput$.get(_.tester.vine).next({index: INDEX, stateId: $otherStateId});

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
        stateId: objectThat<StateId<number|null>>().haveProperties({id: _.$state.id}),
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
      _.stateService.modify(x => x.set(_.$state, 123));

      _.harness.input.selectable.checked = true;
      _.harness.input._.onInput('');
      _.harness.host._.applyFn([]);

      assert(_.stateService.resolve(_.$state)).to.emitWith(INDEX);
    });

    should('emit null if element is unchecked', () => {
      const value = 123;
      // Set the state to some number.
      _.stateService.modify(x => x.set(_.$state, value));

      _.harness.input.selectable.checked = false;
      _.harness.input._.onInput('');
      _.harness.host._.applyFn([]);

      assert(_.stateService.resolve(_.$state)).to.emitWith(null);
    });
  });

  test('updateDomValue', () => {
    should('check the element if new value is the same as the index', () => {
      _.stateService.modify(x => x.set(_.$state, INDEX));

      _.harness.host._.clearFn([]);

      assert(_.harness.input.selectable.checked).to.equal(true);
    });

    should('uncheck the element if the new value is different from the index', () => {
      _.stateService.modify(x => x.set(_.$state, 1));

      _.harness.host._.clearFn([]);

      assert(_.harness.input.selectable.checked).to.equal(false);
    });
  });
});
