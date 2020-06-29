import { assert, objectThat, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map } from 'rxjs/operators';

import { _p } from '../../app/app';

import { Value } from './base-input';
import { $, DEBOUNCE_MS, TextInput } from './text-input';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/text-input', init => {
  const _ = init(() => {
    const tester = testerFactory.build([TextInput], document);
    const el = tester.createElement('mk-text-input');
    return {el, tester};
  });

  test('updateDomValue', () => {
    should(`set the value correctly`, () => {
      const value = 'value';
      run(_.el.setAttribute($.host._.defaultValue, value));
      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.el.getElement($.input).pipe(map(el => el.value))).to.emitWith(value);
    });
  });

  test('setupHandleInput', () => {
    should(`set the initial value correctly`, () => {
      // Change the input and wait for the value to update.
      const value = 'value';
      run(_.el.setInputValue($.input, value));
      _.tester.fakeTime.tick(DEBOUNCE_MS);

      assert(_.el.getObserver($.host._.value)).to.emitWith(
          objectThat<Value<string>>().haveProperties({trigger: 'input', value}),
      );

      // Clear the input.
      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.el.getObserver($.host._.value)).to.emitWith(
          objectThat<Value<string>>().haveProperties({trigger: 'default', value: ''}),
      );
    });

    should(`revert to the previous value if the new value is invalid`, () => {
      // Change the input and wait for the value to update.
      const value = 'value';
      run(_.el.setInputValue($.input, value));
      _.tester.fakeTime.tick(DEBOUNCE_MS);

      const value2 = 'otherValue';
      run(_.el.callFunction($.host._.setValidator, [(str: string) => str === 'value']));
      run(_.el.setInputValue($.input, value2));
      _.tester.fakeTime.tick(DEBOUNCE_MS);

      assert(_.el.getObserver($.host._.value)).to.emitWith(
          objectThat<Value<string>>().haveProperties({trigger: 'input', value}),
      );
    });
  });
});
