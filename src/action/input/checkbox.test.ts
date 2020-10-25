import { assert, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../../app/app';
import { $stateService } from '../../core/state-service';
import { $, $checkbox, Checkbox, CheckedValue } from '../input/checkbox';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/checkbox', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Checkbox], document);
    const el = tester.createElement($checkbox.tag);
    const displaySlotName$ = el.getAttribute($.display._.name);

    const stateService = new StateService();
    const $state = stateService.add<CheckedValue>(true);

    $stateService.set(tester.vine, () => stateService);
    el.setAttribute($.host._.stateId, $state);

    return {displaySlotName$, el, $state, stateService};
  });

  test('displaySlot$', () => {
    should(`set the slot name to display_checked if checked`, () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = false;
      el.checked = true;
      _.el.dispatchEvent($.checkbox._.onInput);

      assert(_.displaySlotName$).to.emitWith('display_checked');
    });

    should(`set the slot name to display_unchecked if unchecked`, () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = false;
      el.checked = false;
      _.el.dispatchEvent($.checkbox._.onInput);

      assert(_.displaySlotName$).to.emitWith('display_unchecked');
    });

    should(`set the slot name to display_unknown if unknown`, () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = true;
      el.checked = true;
      _.el.dispatchEvent($.checkbox._.onInput);

      assert(_.displaySlotName$).to.emitWith('display_unknown');
    });

    should(`update the slot name if the value is set by calling clear`, () => {
      _.stateService.set(_.$state, true);
      _.el.callFunction($.host._.clearFn, []);

      assert(_.displaySlotName$).to.emitWith('display_checked');
    });
  });

  test('domValue$', () => {
    should(`emit true if the checked`, () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = false;
      el.checked = true;
      _.el.dispatchEvent($.checkbox._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.get(_.$state)).to.emitWith(true);
    });

    should(`emit false if the unchecked`, () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = false;
      el.checked = false;
      _.el.dispatchEvent($.checkbox._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.get(_.$state)).to.emitWith(false);
    });

    should(`emit unknown if the value is indeterminate`, () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = true;
      el.checked = true;
      _.el.dispatchEvent($.checkbox._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.get(_.$state)).to.emitWith('unknown');
    });
  });

  test('updateDomValue', () => {
    should(`set true value correctly`, () => {
      _.stateService.set(_.$state, true);

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.checkbox).checked).to.equal(true);
      assert(_.el.getElement($.checkbox).indeterminate).to.equal(false);
    });

    should(`set false value correctly`, () => {
      _.stateService.set(_.$state, false);

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.checkbox).checked).to.equal(false);
      assert(_.el.getElement($.checkbox).indeterminate).to.equal(false);
    });

    should(`set unknown value correctly`, () => {
      _.stateService.set(_.$state, 'unknown');

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.checkbox).checked).to.equal(false);
      assert(_.el.getElement($.checkbox).indeterminate).to.equal(true);
    });
  });
});
