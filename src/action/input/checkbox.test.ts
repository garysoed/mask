import { assert, run, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map, tap } from 'rxjs/operators';

import { _p } from '../../app/app';
import { $stateService } from '../../core/state-service';
import { $, Checkbox, CheckedValue } from '../input/checkbox';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/checkbox', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Checkbox], document);
    const el = tester.createElement('mk-checkbox');
    const displaySlotName$ = el.getAttribute($.display._.name);

    const stateService = new StateService();
    const $state = stateService.add<CheckedValue>(true);

    $stateService.set(tester.vine, () => stateService);
    run(el.setAttribute($.host._.stateId, $state));

    return {displaySlotName$, el, $state, stateService};
  });

  test('displaySlot$', () => {
    should(`set the slot name to display_checked if checked`, () => {
      run(_.el.getElement($.checkbox).pipe(
          tap(el => {
            el.indeterminate = false;
            el.checked = true;
          }),
      ));
      run(_.el.dispatchEvent($.checkbox._.onInput));

      assert(_.displaySlotName$).to.emitWith('display_checked');
    });

    should(`set the slot name to display_unchecked if unchecked`, () => {
      run(_.el.getElement($.checkbox).pipe(
          tap(el => {
            el.indeterminate = false;
            el.checked = false;
          }),
      ));
      run(_.el.dispatchEvent($.checkbox._.onInput));

      assert(_.displaySlotName$).to.emitWith('display_unchecked');
    });

    should(`set the slot name to display_unknown if unknown`, () => {
      run(_.el.getElement($.checkbox).pipe(
          tap(el => {
            el.indeterminate = true;
            el.checked = true;
          }),
      ));
      run(_.el.dispatchEvent($.checkbox._.onInput));

      assert(_.displaySlotName$).to.emitWith('display_unknown');
    });

    should(`update the slot name if the value is set by calling clear`, () => {
      _.stateService.set(_.$state, true);
      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.displaySlotName$).to.emitWith('display_checked');
    });
  });

  test('domValue$', () => {
    should(`emit true if the checked`, () => {
      run(_.el.getElement($.checkbox).pipe(
          tap(el => {
            el.indeterminate = false;
            el.checked = true;
          }),
      ));
      run(_.el.dispatchEvent($.checkbox._.onInput));
      run(_.el.callFunction($.host._.applyFn, []));

      assert(_.stateService.get(_.$state)).to.emitWith(true);
    });

    should(`emit false if the unchecked`, () => {
      run(_.el.getElement($.checkbox).pipe(
          tap(el => {
            el.indeterminate = false;
            el.checked = false;
          }),
      ));
      run(_.el.dispatchEvent($.checkbox._.onInput));
      run(_.el.callFunction($.host._.applyFn, []));

      assert(_.stateService.get(_.$state)).to.emitWith(false);
    });

    should(`emit unknown if the value is indeterminate`, () => {
      run(_.el.getElement($.checkbox).pipe(
          tap(el => {
            el.indeterminate = true;
            el.checked = true;
          }),
      ));
      run(_.el.dispatchEvent($.checkbox._.onInput));
      run(_.el.callFunction($.host._.applyFn, []));

      assert(_.stateService.get(_.$state)).to.emitWith('unknown');
    });
  });

  test('updateDomValue', _, init => {
    const _ = init(_ => {
      const checked$ = _.el.getElement($.checkbox).pipe(map(el => el.checked));
      const indeterminate$ = _.el.getElement($.checkbox).pipe(map(el => el.indeterminate));
      return {..._, checked$, indeterminate$};
    });

    should(`set true value correctly`, () => {
      _.stateService.set(_.$state, true);

      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.checked$).to.emitWith(true);
      assert(_.indeterminate$).to.emitWith(false);
    });

    should(`set false value correctly`, () => {
      _.stateService.set(_.$state, false);

      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.checked$).to.emitWith(false);
      assert(_.indeterminate$).to.emitWith(false);
    });

    should(`set unknown value correctly`, () => {
      _.stateService.set(_.$state, 'unknown');

      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.checked$).to.emitWith(false);
      assert(_.indeterminate$).to.emitWith(true);
    });
  });
});
