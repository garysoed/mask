import {assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {StateId, StateService} from 'gs-tools/export/state';
import {PersonaTesterFactory} from 'persona/export/testing';
import {switchMap, take, tap} from 'rxjs/operators';

import {_p} from '../../app/app';
import {$stateService} from '../../core/state-service';

import {$onRadioInput$, OnRadioInput} from './on-radio-input';
import {$, $radioInput, RadioInput} from './radio-input';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/action/input/radio-input', init => {
  const INDEX = 3;

  const _ = init(() => {
    const tester = testerFactory.build([RadioInput], document);
    const el = tester.createElement($radioInput.tag);
    const displaySlotName$ = el.getAttribute($.display._.name);

    const stateService = new StateService();
    const $state = stateService.add<number|null>(null);

    $stateService.set(tester.vine, () => stateService);
    el.setAttribute($.host._.stateId, $state);
    el.setAttribute($.host._.index, INDEX);

    return {displaySlotName$, el, $state, stateService, tester};
  });

  test('displaySlot$', () => {
    should('set the slot to display_checked if checked', () => {
      const el = _.el.getElement($.input);
      el.checked = true;
      _.el.dispatchEvent($.input._.onInput);

      assert(_.displaySlotName$).to.emitWith('display_checked');
    });

    should('set the slot to display_unchecked if unchecked', () => {
      const el = _.el.getElement($.input);
      el.checked = false;
      _.el.dispatchEvent($.input._.onInput);

      assert(_.displaySlotName$).to.emitWith('display_unchecked');
    });
  });

  test('domValue$', () => {
    should('set the state correctly', () => {
      const el1 = _.tester.createElement($radioInput.tag);
      el1.setAttribute($.host._.stateId, _.$state);
      el1.setAttribute($.host._.index, 1);

      const el2 = _.tester.createElement($radioInput.tag);
      el2.setAttribute($.host._.stateId, _.$state);
      el2.setAttribute($.host._.index, 2);

      const state$ = createSpySubject(_.stateService.get(_.$state));

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

    should('set the state correctly with apply on change', () => {
      _.el.setHasAttribute($.host._.applyOnChange, true);

      const el1 = _.tester.createElement($radioInput.tag);
      el1.setAttribute($.host._.stateId, _.$state);
      el1.setAttribute($.host._.index, 1);
      el1.setHasAttribute($.host._.applyOnChange, true);

      const el2 = _.tester.createElement($radioInput.tag);
      el2.setAttribute($.host._.stateId, _.$state);
      el2.setAttribute($.host._.index, 2);
      el2.setHasAttribute($.host._.applyOnChange, true);

      const state$ = createSpySubject(_.stateService.get(_.$state));

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
      run($onRadioInput$.get(_.tester.vine).pipe(
          take(1),
          tap(subject => {
            subject.next({index: 1, stateId: _.$state});
          }),
      ));

      assert(_.displaySlotName$).to.emitWith('display_unchecked');
    });

    should('do nothing if the global radio input emits for the current index', () => {
      run($onRadioInput$.get(_.tester.vine).pipe(
          take(1),
          tap(subject => {
            subject.next({index: INDEX, stateId: _.$state});
          }),
      ));

      assert(_.displaySlotName$).to.emitWith('display_checked');
    });

    should('do nothing if the global radio input emits and the ID doesn\'t match', () => {
      const $otherStateId = _.stateService.add<number|null>(null);
      run($onRadioInput$.get(_.tester.vine).pipe(
          take(1),
          tap(subject => {
            subject.next({index: INDEX, stateId: $otherStateId});
          }),
      ));

      assert(_.displaySlotName$).to.emitWith('display_checked');
    });
  });

  test('handleOnRadioInput$', () => {
    should('emit the global radio input', () => {
      const onRadioInput$ = createSpySubject(
          $onRadioInput$.get(_.tester.vine).pipe(switchMap(subject => subject)),
      );

      // Check the element.
      _.el.getElement($.input).checked = true;
      _.el.dispatchEvent($.input._.onInput);

      assert(onRadioInput$).to.emitWith(objectThat<OnRadioInput>().haveProperties({
        index: INDEX,
        stateId: objectThat<StateId<number|null>>().haveProperties({id: _.$state.id}),
      }));
    });

    should('do nothing if the value is null', () => {
      const onRadioInput$ = createSpySubject(
          $onRadioInput$.get(_.tester.vine).pipe(switchMap(subject => subject)),
      );

      // Check the element.
      _.el.getElement($.input).checked = false;
      _.el.dispatchEvent($.input._.onInput);

      assert(onRadioInput$).toNot.emit();
    });
  });

  test('nullableDomValue$', () => {
    should('emit the index if element is checked', () => {
      // Set the state to some number.
      _.stateService.set(_.$state, 123);

      _.el.getElement($.input).checked = true;
      _.el.dispatchEvent($.input._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.get(_.$state)).to.emitWith(INDEX);
    });

    should('emit null if element is unchecked', () => {
      const value = 123;
      // Set the state to some number.
      _.stateService.set(_.$state, value);

      _.el.getElement($.input).checked = false;
      _.el.dispatchEvent($.input._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.get(_.$state)).to.emitWith(null);
    });
  });

  test('updateDomValue', () => {
    should('check the element if new value is the same as the index', () => {
      _.stateService.set(_.$state, INDEX);

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.input).checked).to.equal(true);
    });

    should('uncheck the element if the new value is different from the index', () => {
      _.stateService.set(_.$state, 1);

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.input).checked).to.equal(false);
    });
  });
});
