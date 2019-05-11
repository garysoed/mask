import { assert, runEnvironment, setup, should, test } from '@gs-testing';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { _p } from '../../app/app';
import { $, Checkbox } from './checkbox';

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/checkbox', () => {
  runEnvironment(new PersonaTesterEnvironment());

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Checkbox]);
    el = tester.createElement('mk-checkbox', document.body);
  });

  test('renderIconMode', () => {
    should(`render action`, async () => {
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();

      await assert(tester.getAttribute(el, $.text._.mode)).to.emitWith('action');
    });

    should(`render focus if hovered`, async () => {
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.dispatchEvent(el, $.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      await assert(tester.getAttribute(el, $.text._.mode)).to.emitWith('focus');
    });

    should(`render focus if focused`, async () => {
      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();
      tester.dispatchEvent(el, $.host._.onFocus, new CustomEvent('focus')).subscribe();

      await assert(tester.getAttribute(el, $.text._.mode)).to.emitWith('focus');
    });

    should(`render disabled if disabled`, async () => {
      tester.setHasAttribute(el, $.host._.disabled, true).subscribe();
      tester.dispatchEvent(el, $.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      await assert(tester.getAttribute(el, $.text._.mode)).to.emitWith('disabled');
    });
  });

  test('setupOnClickHandler', () => {
    should(`toggle the icon on click`, async () => {
      tester.dispatchEvent(el, $.root._.onClick, new CustomEvent('click')).subscribe();

      await assert(tester.getAttribute(el, $.text._.iconOut)).to.emitWith(true);
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(true);

      tester.dispatchEvent(el, $.root._.onClick, new CustomEvent('click')).subscribe();

      await assert(tester.getAttribute(el, $.text._.iconOut)).to.emitWith(false);
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(false);
    });

    should(`change to true if unknown`, async () => {
      // Set the init value to unknown, then click it.
      tester.setAttribute(el, $.host._.initValue, 'unknown').subscribe();
      tester.dispatchEvent(el, $.root._.onClick, new CustomEvent('click')).subscribe();

      await assert(tester.getAttribute(el, $.text._.iconOut)).to.emitWith(true);
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(true);
    });

    should(`do nothing on click if disabled`, async () => {
      tester.setHasAttribute(el, $.host._.disabled, true).subscribe();
      tester.dispatchEvent(el, $.root._.onClick, new CustomEvent('click')).subscribe();

      await assert(tester.getAttribute(el, $.text._.iconOut)).to.emitWith(false);
      await assert(tester.getAttribute(el, $.host._.value)).to.emitWith(false);
    });
  });
});