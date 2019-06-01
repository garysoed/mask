import { assert, setup, should, test } from '@gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { _p } from '../../app/app';
import { $, Checkbox } from './checkbox';

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/checkbox', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Checkbox]);
    el = tester.createElement('mk-checkbox', document.body);
  });

  test('renderIconMode', () => {
    should(`render action`, () => {
      el.setHasAttribute($.host._.disabled, false).subscribe();

      assert(el.getAttribute($.text._.mode)).to.emitWith('action');
    });

    should(`render focus if hovered`, () => {
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      assert(el.getAttribute($.text._.mode)).to.emitWith('focus');
    });

    should(`render focus if focused`, () => {
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.dispatchEvent($.host._.onFocus, new CustomEvent('focus')).subscribe();

      assert(el.getAttribute($.text._.mode)).to.emitWith('focus');
    });

    should(`render disabled if disabled`, () => {
      el.setHasAttribute($.host._.disabled, true).subscribe();
      el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      assert(el.getAttribute($.text._.mode)).to.emitWith('disabled');
    });
  });

  test('setupOnClickHandler', () => {
    should(`toggle the icon on click`, () => {
      el.dispatchEvent($.root._.onClick, new CustomEvent('click')).subscribe();

      assert(el.getAttribute($.text._.iconOut)).to.emitWith(true);
      assert(el.getAttribute($.host._.value)).to.emitWith(true);

      el.dispatchEvent($.root._.onClick, new CustomEvent('click')).subscribe();

      assert(el.getAttribute($.text._.iconOut)).to.emitWith(false);
      assert(el.getAttribute($.host._.value)).to.emitWith(false);
    });

    should(`change to true if unknown`, () => {
      // Set the init value to unknown, then click it.
      el.setAttribute($.host._.initValue, 'unknown').subscribe();
      el.dispatchEvent($.root._.onClick, new CustomEvent('click')).subscribe();

      assert(el.getAttribute($.text._.iconOut)).to.emitWith(true);
      assert(el.getAttribute($.host._.value)).to.emitWith(true);
    });

    should(`do nothing on click if disabled`, () => {
      el.setHasAttribute($.host._.disabled, true).subscribe();
      el.dispatchEvent($.root._.onClick, new CustomEvent('click')).subscribe();

      assert(el.getAttribute($.text._.iconOut)).to.emitWith(false);
      assert(el.getAttribute($.host._.value)).to.emitWith(false);
    });
  });
});
