import { assert, setup, should, test } from '@gs-testing';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { _p, _v } from '../../app/app';
import { $, $debounceMs, TextInput } from './text-input';

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/TextInput', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([TextInput]);
    $debounceMs.get(tester.vine).next(0);
    el = tester.createElement('mk-text-input', document.body);
  });

  test('getCurrentValueObs', () => {
    should(`update the host value when typing`, async () => {
      const value1 = 'value1';
      tester.setInputValue(el, $.input, value1).subscribe();

      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(value1);
    });
  });

  test('updateCurrentValue', () => {
    should(`set the initial value correctly`, async () => {
      // Change the input and wait for the value to update.
      const value1 = 'value1';
      tester.setInputValue(el, $.input, value1).subscribe();
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(value1);

      // Clear the input.
      tester.callFunction(el, $.host._.clearFn, []).subscribe();
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith('');
    });
  });
});
