import { assert, setup, should, test } from '@gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';

import { _p } from '../../app/app';

import { $, $debounceMs, DEBOUNCE_MS, TextInput } from './text-input';

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/text-input', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([TextInput]);
    $debounceMs.get(tester.vine).next(0);
    el = tester.createElement('mk-text-input', document.body);
  });

  test('getCurrentValueObs', () => {
    should(`update the host value when typing`, () => {
      const value1 = 'value1';
      el.setInputValue($.input, value1).subscribe();

      tester.time.tick(DEBOUNCE_MS);

      assert(el.getAttribute($.host._.value)).to.emitWith(value1);
    });
  });

  test('updateCurrentValue', () => {
    should(`set the initial value correctly`, () => {
      // Change the input and wait for the value to update.
      const value1 = 'value1';
      el.setInputValue($.input, value1).subscribe();
      tester.time.tick(DEBOUNCE_MS);

      assert(el.getAttribute($.host._.value)).to.emitWith(value1);

      // Clear the input.
      el.callFunction($.host._.clearFn, []).subscribe();
      assert(el.getAttribute($.host._.value)).to.emitWith('');
    });
  });
});
