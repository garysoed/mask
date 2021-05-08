import {$stateService} from 'grapevine';
import {assert, createSpySubject, objectThat, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';

import goldenChecked from './goldens/radio-input__checked.html';
import goldenDefault from './goldens/radio-input__default.html';
import goldenUnchecked from './goldens/radio-input__unchecked.html';
import {$onRadioInput$, OnRadioInput} from './on-radio-input';
import {$, RadioInput} from './radio-input';


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
    const el = tester.createElement(RadioInput);

    const $state = stateService.modify(x => x.add<number|null>(null));
    el.setAttribute($.host._.stateId, $state);
    el.setAttribute($.host._.index, INDEX);

    return {el, $state, stateService, tester};
  });

  test('render', () => {
    should('render default config correctly', () => {
      _.el.setAttribute($.host._.label, 'label');

      assert(_.el.flattenContent()).to.matchSnapshot('render');
    });
  });

  test('checkMode$', () => {
    should('set the slot to display_checked if checked', () => {
      const el = _.el.getElement($.input);
      el.checked = true;
      _.el.setAttribute($.host._.label, 'label');
      _.el.dispatchEvent($.input._.onInput);

      assert(_.el.getClassList($.container)).to.haveExactElements(new Set(['display_checked']));
      assert(_.el.flattenContent()).to.matchSnapshot('checked');
    });

    should('set the slot to display_unchecked if unchecked', () => {
      const el = _.el.getElement($.input);
      el.checked = false;
      _.el.setAttribute($.host._.label, 'label');
      _.el.dispatchEvent($.input._.onInput);

      assert(_.el.getClassList($.container)).to.haveExactElements(new Set(['display_unchecked']));
      assert(_.el.flattenContent()).to.matchSnapshot('unchecked');
    });
  });

  test('domValue$', () => {
    should('set the state correctly', () => {
      const el1 = _.tester.createElement(RadioInput);
      el1.setAttribute($.host._.stateId, _.$state);
      el1.setAttribute($.host._.index, 1);

      const el2 = _.tester.createElement(RadioInput);
      el2.setAttribute($.host._.stateId, _.$state);
      el2.setAttribute($.host._.index, 2);

      const state$ = createSpySubject(_.stateService.resolve(_.$state));

      // Click on the third one.
      const el = _.el.getElement($.input);
      el.checked = true;
      _.el.dispatchEvent($.input._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      // Then the second one.
      el2.getElement($.input).checked = true;
      el2.dispatchEvent($.input._.onInput);
      el2.callFunction($.host._.applyFn, []);

      // Click on the third one again.
      _.el.getElement($.input).checked = true;
      _.el.dispatchEvent($.input._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(state$).to.emitSequence([null, 3, 2, 3]);
    });

    should('set the state correctly', () => {
      const el1 = _.tester.createElement(RadioInput);
      el1.setAttribute($.host._.stateId, _.$state);
      el1.setAttribute($.host._.index, 1);

      const el2 = _.tester.createElement(RadioInput);
      el2.setAttribute($.host._.stateId, _.$state);
      el2.setAttribute($.host._.index, 2);

      const state$ = createSpySubject(_.stateService.resolve(_.$state));

      // Click on the third one.
      _.el.getElement($.input).checked = true;
      _.el.dispatchEvent($.input._.onInput);

      // Then the second one.
      el2.getElement($.input).checked = true;
      el2.dispatchEvent($.input._.onInput);

      // Click on the third one again.
      _.el.getElement($.input).checked = true;
      _.el.dispatchEvent($.input._.onInput);

      assert(state$).to.emitSequence([null, 3, 2, 3]);
    });
  });

  test('handleOnGlobalRadioInput$', _, init => {
    const _ = init(_ => {
      // Check the element.
      _.el.getElement($.input).checked = true;
      _.el.dispatchEvent($.input._.onInput);

      return _;
    });

    should('reset the dom value if global radio input emits for other index and the ID match', () => {
      $onRadioInput$.get(_.tester.vine).next({index: 1, stateId: _.$state});

      assert(_.el.getClassList($.container)).to.haveExactElements(new Set(['display_unchecked']));
    });

    should('do nothing if the global radio input emits for the current index', () => {
      $onRadioInput$.get(_.tester.vine).next({index: INDEX, stateId: _.$state});

      assert(_.el.getClassList($.container)).to.haveExactElements(new Set(['display_checked']));
    });

    should('do nothing if the global radio input emits and the ID doesn\'t match', () => {
      const $otherStateId = _.stateService.modify(x => x.add<number|null>(null));
      $onRadioInput$.get(_.tester.vine).next({index: INDEX, stateId: $otherStateId});

      assert(_.el.getClassList($.container)).to.haveExactElements(new Set(['display_checked']));
    });
  });

  test('handleOnRadioInput$', () => {
    should('emit the global radio input', () => {
      const onRadioInput$ = createSpySubject($onRadioInput$.get(_.tester.vine));

      // Check the element.
      _.el.getElement($.input).checked = true;
      _.el.dispatchEvent($.input._.onInput);

      assert(onRadioInput$).to.emitWith(objectThat<OnRadioInput>().haveProperties({
        index: INDEX,
        stateId: objectThat<StateId<number|null>>().haveProperties({id: _.$state.id}),
      }));
    });

    should('do nothing if the value is null', () => {
      const onRadioInput$ = createSpySubject($onRadioInput$.get(_.tester.vine));

      // Check the element.
      _.el.getElement($.input).checked = false;
      _.el.dispatchEvent($.input._.onInput);

      assert(onRadioInput$).toNot.emit();
    });
  });

  test('nullableDomValue$', () => {
    should('emit the index if element is checked', () => {
      // Set the state to some number.
      _.stateService.modify(x => x.set(_.$state, 123));

      _.el.getElement($.input).checked = true;
      _.el.dispatchEvent($.input._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.resolve(_.$state)).to.emitWith(INDEX);
    });

    should('emit null if element is unchecked', () => {
      const value = 123;
      // Set the state to some number.
      _.stateService.modify(x => x.set(_.$state, value));

      _.el.getElement($.input).checked = false;
      _.el.dispatchEvent($.input._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.resolve(_.$state)).to.emitWith(null);
    });
  });

  test('updateDomValue', () => {
    should('check the element if new value is the same as the index', () => {
      _.stateService.modify(x => x.set(_.$state, INDEX));

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.input).checked).to.equal(true);
    });

    should('uncheck the element if the new value is different from the index', () => {
      _.stateService.modify(x => x.set(_.$state, 1));

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.input).checked).to.equal(false);
    });
  });
});
