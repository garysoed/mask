import { assert, mockTime, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../../app/app';

import { $, DEBOUNCE_MS, TextInput } from './text-input';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/text-input', init => {
  const _ = init(() => {
    const fakeTime = mockTime(window);
    const tester = testerFactory.build([TextInput], document);
    const el = tester.createElement('mk-text-input');
    return {el, tester, fakeTime};
  });

  test('getCurrentValueObs', () => {
    should(`update the host value when typing`, () => {
      const value1 = 'value1';
      run(_.el.setInputValue($.input, value1));

      _.fakeTime.tick(DEBOUNCE_MS);

      assert(_.el.getAttribute($.host._.value)).to.emitWith(value1);
    });
  });

  test('setupHandleInput', () => {
    should(`set the initial value correctly`, () => {
      // Change the input and wait for the value to update.
      const value = 'value';
      run(_.el.setInputValue($.input, value));
      _.fakeTime.tick(DEBOUNCE_MS);

      assert(_.el.getAttribute($.host._.value)).to.emitWith(value);

      // Clear the input.
      run(_.el.callFunction($.host._.clearFn, []));
      assert(_.el.getAttribute($.host._.value)).to.emitWith('');
    });

    should(`revert to the previous value if the new value is invalid`, () => {
      // Change the input and wait for the value to update.
      const value = 'value';
      run(_.el.setInputValue($.input, value));
      _.fakeTime.tick(DEBOUNCE_MS);

      const value2 = 'otherValue';
      run(_.el.callFunction($.host._.setValidator, [(str: string) => str === 'value']));
      run(_.el.setInputValue($.input, value2));
      _.fakeTime.tick(DEBOUNCE_MS);

      assert(_.el.getAttribute($.host._.value)).to.emitWith(value);
    });
  });
});
