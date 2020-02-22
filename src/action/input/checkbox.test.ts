import { assert, setup, should, test } from 'gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { map } from 'rxjs/operators';

import { _p } from '../../app/app';
import { IconMode } from '../../display/icon-mode';

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

      assert(el.getAttribute($.checkmark._.mode)).to.emitWith(IconMode.ACTION);
    });

    should(`render focus if hovered`, () => {
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      assert(el.getAttribute($.checkmark._.mode)).to.emitWith(IconMode.FOCUS);
    });

    should(`render focus if focused`, () => {
      el.setHasAttribute($.host._.disabled, false).subscribe();
      el.dispatchEvent($.host._.onFocus, new CustomEvent('focus')).subscribe();

      assert(el.getAttribute($.checkmark._.mode)).to.emitWith(IconMode.FOCUS);
    });

    should(`render disabled if disabled`, () => {
      el.setHasAttribute($.host._.disabled, true).subscribe();
      el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')).subscribe();

      assert(el.getAttribute($.checkmark._.mode)).to.emitWith(IconMode.DISABLED);
    });
  });

  test('setupOnClickHandler', () => {
    should(`toggle the icon on click`, () => {
      el.dispatchEvent($.checkbox._.onClick, new CustomEvent('click')).subscribe();

      assert(el.getAttribute($.checkbox._.checkedOut)).to.emitWith('checked');
      assert(el.getAttribute($.host._.value)).to.emitWith(true);

      el.dispatchEvent($.checkbox._.onClick, new CustomEvent('click')).subscribe();

      assert(el.getAttribute($.checkbox._.checkedOut)).to.emitWith('');
      assert(el.getAttribute($.host._.value)).to.emitWith(false);
    });

    should(`change to true if unknown`, () => {
      // Set the init value to unknown, then click it.
      el.setAttribute($.host._.initValue, 'unknown').subscribe();
      el.dispatchEvent($.checkbox._.onClick, new CustomEvent('click')).subscribe();

      assert(el.getAttribute($.checkbox._.checkedOut)).to.emitWith('checked');
      assert(el.getAttribute($.host._.value)).to.emitWith(true);
    });

    should(`do nothing on click if disabled`, () => {
      el.setHasAttribute($.host._.disabled, true).subscribe();
      el.dispatchEvent($.checkbox._.onClick, new CustomEvent('click')).subscribe();

      assert(el.getAttribute($.checkbox._.checkedOut)).to.emitWith('');
      assert(el.getAttribute($.host._.value)).to.emitWith(false);
    });
  });

  should(`display unknown state correctly`, () => {
    el.setAttribute($.host._.initValue, 'unknown').subscribe();
    el.callFunction($.host._.clearFn, []).subscribe();

    assert(el.getElement($.checkbox).pipe(map(element => element.indeterminate))).to
        .emitWith(true);
    assert(el.getAttribute($.host._.value)).to.emitWith('unknown');
  });
});
