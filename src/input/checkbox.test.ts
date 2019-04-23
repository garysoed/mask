import { assert, setup, should, test } from '@gs-testing/main';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { tap } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $, Checkbox } from './checkbox';

const testerFactory = new PersonaTesterFactory(_p);

test('mask.input.checkbox', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Checkbox]);
    el = tester.createElement('mk-checkbox', document.body);
  });

  // test('providesInitValue_', () => {
    // should.only(`set the initial value when clear is called`, async () => {
    //   tester.setAttribute(el, $.host._.initValue, true).subscribe();

    //   // Change the value.
    //   tester.dispatchEvent(el, $.host, new CustomEvent('click')).subscribe();
    //   await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(false);

    //   // Clear the input.
    //   tester.callFunction(el, $.host._.clearFn, []).subscribe();
    //   await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(true);
    // });

    // should(`set the initial value when it is changed and input element is clean`, async () => {
    //   // Set the initial value.
    //   const initValue = 'initValue';
    //   tester.setAttribute(el, $.host._.initValue, initValue).subscribe();
    //   await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(initValue);
    // });

    // should(`not set the initial value when it is changed but input is dirty`, async () => {
    //   // Change the input and wait for the value to update.
    //   const value1 = 'value1';
    //   tester.setInputValue(el, $.input, value1).subscribe();
    //   await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(value1);

    //   // Set the initial value.
    //   const initValue = 'initValue';
    //   tester.setAttribute(el, $.host._.initValue, initValue).subscribe();
    //   await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(value1);
    // });
  // });

  test('renderIcon_', () => {
    should(`toggle the icon on click`, async () => {
      tester.dispatchEvent(el, $.root, new CustomEvent('click')).subscribe();

      await assert(tester.getAttribute(el, $.text._.iconOut)).to.emitWith(true);

      tester.dispatchEvent(el, $.root, new CustomEvent('click')).subscribe();

      await assert(tester.getAttribute(el, $.text._.iconOut)).to.emitWith(false);
    });

    // TODO
    should.only(`change to false if unknown`);
  });

  test('renderIconMode_', () => {
    should(`render action`, async () => {
      tester.setAttribute(el, $.host._.disabled, false).subscribe();

      await assert(tester.getAttribute(el, $.text._.mode)).to.emitWith('action');
    });

    should(`render focus if hovered`, async () => {
      tester.setAttribute(el, $.host._.disabled, false).subscribe();
      tester.dispatchEvent(el, $.host, new CustomEvent('mouseenter')).subscribe();

      await assert(tester.getAttribute(el, $.text._.mode)).to.emitWith('focus');
    });

    should(`render focus if focused`, async () => {
      tester.setAttribute(el, $.host._.disabled, false).subscribe();
      tester.dispatchEvent(el, $.host, new CustomEvent('focus')).subscribe();

      await assert(tester.getAttribute(el, $.text._.mode)).to.emitWith('focus');
    });

    should(`render disabled if disabled`, async () => {
      tester.setAttribute(el, $.host._.disabled, true).subscribe();
      tester.dispatchEvent(el, $.host, new CustomEvent('mouseenter')).subscribe();

      await assert(tester.getAttribute(el, $.text._.mode)).to.emitWith('disabled');
    });
  });
});
