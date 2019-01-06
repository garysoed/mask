import { assert, setup, should, test } from 'gs-testing/export/main';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { $, TextInput } from './text-input';

const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

// TODO: Unskip the tests.
test.skip('input.TextInput', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([TextInput]);
    el = tester.createElement('mk-text-input', document.body);
  });

  test('renderValue', () => {
    should(`dispatch change event when typing`, async () => {
      const value1 = 'value1';
      tester.setInputValue(el, $.input, value1).subscribe();

      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(value1);
    });
  });

  test('setInitValue_', () => {
    should(`set the initial value when clear is called`, async () => {
      // Change the input and wait for the value to update.
      const value1 = 'value1';
      tester.setInputValue(el, $.input, value1).subscribe();
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(value1);

      // Clear the input.
      tester.sendSignal(el, $.host._.clearObs, undefined).subscribe();
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith('');
    });

    should(`set the initial value when it is changed and input element is clean`, async () => {
      // Set the initial value.
      const initValue = 'initValue';
      tester.setAttribute(el, $.host._.initValue, initValue).subscribe();
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(initValue);
    });

    should(`not set the initial value when it is changed but input is dirty`, async () => {
      // Change the input and wait for the value to update.
      const value1 = 'value1';
      tester.setInputValue(el, $.input, value1).subscribe();
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(value1);

      // Set the initial value.
      const initValue = 'initValue';
      tester.setAttribute(el, $.host._.initValue, initValue).subscribe();
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(value1);
    });
  });
});
