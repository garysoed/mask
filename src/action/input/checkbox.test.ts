import { assert, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map } from 'rxjs/operators';

import { _p } from '../../app/app';
import { IconMode } from '../../display/icon-mode';

import { $, Checkbox } from './checkbox';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/checkbox', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Checkbox], document);
    const el = tester.createElement('mk-checkbox');
    return {el, tester};
  });

  test('renderIconMode', () => {
    should(`render action`, () => {
      run(_.el.setHasAttribute($.host._.disabled, false));

      assert(_.el.getAttribute($.checkmark._.mode)).to.emitWith(IconMode.ACTION);
    });

    should(`render focus if hovered`, () => {
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')));

      assert(_.el.getAttribute($.checkmark._.mode)).to.emitWith(IconMode.FOCUS);
    });

    should(`render focus if focused`, () => {
      run(_.el.setHasAttribute($.host._.disabled, false));
      run(_.el.dispatchEvent($.host._.onFocus, new CustomEvent('focus')));

      assert(_.el.getAttribute($.checkmark._.mode)).to.emitWith(IconMode.FOCUS);
    });

    should(`render disabled if disabled`, () => {
      run(_.el.setHasAttribute($.host._.disabled, true));
      run(_.el.dispatchEvent($.host._.onMouseEnter, new CustomEvent('mouseenter')));

      assert(_.el.getAttribute($.checkmark._.mode)).to.emitWith(IconMode.DISABLED);
    });
  });

  test('setupOnClickHandler', () => {
    should(`toggle the icon on click`, () => {
      run(_.el.dispatchEvent($.checkbox._.onClick, new CustomEvent('click')));

      assert(_.el.getAttribute($.checkbox._.checkedOut)).to.emitWith('checked');
      assert(_.el.getAttribute($.host._.value)).to.emitWith(true);

      run(_.el.dispatchEvent($.checkbox._.onClick, new CustomEvent('click')));

      assert(_.el.getAttribute($.checkbox._.checkedOut)).to.emitWith('');
      assert(_.el.getAttribute($.host._.value)).to.emitWith(false);
    });

    should(`change to true if unknown`, () => {
      // Set the init value to unknown, then click it.
      run(_.el.setAttribute($.host._.initValue, 'unknown'));
      run(_.el.dispatchEvent($.checkbox._.onClick, new CustomEvent('click')));

      assert(_.el.getAttribute($.checkbox._.checkedOut)).to.emitWith('checked');
      assert(_.el.getAttribute($.host._.value)).to.emitWith(true);
    });

    should(`do nothing on click if disabled`, () => {
      run(_.el.setHasAttribute($.host._.disabled, true));
      run(_.el.dispatchEvent($.checkbox._.onClick, new CustomEvent('click')));

      assert(_.el.getAttribute($.checkbox._.checkedOut)).to.emitWith('');
      assert(_.el.getAttribute($.host._.value)).to.emitWith(false);
    });
  });

  should(`display unknown state correctly`, () => {
    run(_.el.setAttribute($.host._.initValue, 'unknown'));
    run(_.el.callFunction($.host._.clearFn, []));

    assert(_.el.getElement($.checkbox).pipe(map(element => element.indeterminate))).to
        .emitWith(true);
    assert(_.el.getAttribute($.host._.value)).to.emitWith('unknown');
  });
});
