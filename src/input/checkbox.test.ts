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

  test('renderIconMode', () => {
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

  test('setupOnClickHandler', () => {
    should(`toggle the icon on click`, async () => {
      tester.dispatchEvent(el, $.root, new CustomEvent('click')).subscribe();

      await assert(tester.getAttribute(el, $.text._.iconOut)).to.emitWith(true);

      tester.dispatchEvent(el, $.root, new CustomEvent('click')).subscribe();

      await assert(tester.getAttribute(el, $.text._.iconOut)).to.emitWith(false);
    });

    should(`change to false if unknown`, async () => {
      // Set the init value to unknown, then click it.
      tester.setAttribute(el, $.host._.initValue, 'unknown').subscribe();
      tester.dispatchEvent(el, $.root, new CustomEvent('click')).subscribe();

      await assert(tester.getAttribute(el, $.text._.iconOut)).to.emitWith(false);
    });
  });
});
