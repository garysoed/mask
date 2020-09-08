import { assert, objectThat, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map, tap } from 'rxjs/operators';

import { _p } from '../../app/app';
import { IconMode } from '../../display-old/icon-mode';

import { Value } from './base-input';
import { $, Checkbox, CheckedValue } from './checkbox';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/checkbox', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Checkbox], document);
    const el = tester.createElement('mk-checkbox');
    const checkmark$ = el.getAttribute($.checkmark._.icon);
    return {checkmark$, el, tester};
  });

  test('updateDomValue', _, init => {
    const _ = init(_ => {
      const checked$ = _.el.getElement($.checkbox).pipe(map(el => el.checked));
      const indeterminate$ = _.el.getElement($.checkbox).pipe(map(el => el.indeterminate));
      return {..._, checked$, indeterminate$};
    });

    should(`set true value correctly`, () => {
      run(_.el.setAttribute($.host._.defaultValue, true));
      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.checked$).to.emitWith(true);
      assert(_.indeterminate$).to.emitWith(false);
    });

    should(`set false value correctly`, () => {
      run(_.el.setAttribute($.host._.defaultValue, false));
      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.checked$).to.emitWith(false);
      assert(_.indeterminate$).to.emitWith(false);
    });

    should(`set unknown value correctly`, () => {
      run(_.el.setAttribute($.host._.defaultValue, 'unknown'));
      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.checked$).to.emitWith(false);
      assert(_.indeterminate$).to.emitWith(true);
    });
  });

  test('renderHasText', () => {
    should(`add the hasText class if label exists`, () => {
      run(_.el.setAttribute($.host._.label, 'label'));

      assert(_.el.getHasClass($.container._.hasText)).to.emitWith(true);
    });

    should(`remove the hasText class if label doesn't exist`, () => {
      run(_.el.setAttribute($.host._.label, ''));

      assert(_.el.getHasClass($.container._.hasText)).to.emitWith(false);
    });
  });

  test('setupOnInput', () => {
    should(`emit true if the value is true`, () => {
      run(_.el.getElement($.checkbox).pipe(
          tap(el => {
            el.indeterminate = false;
            el.checked = true;
          }),
      ));
      run(_.el.dispatchEvent($.checkbox._.onInput));

      assert(_.el.getObserver($.host._.value)).to.emitWith(
          objectThat<Value<boolean>>().haveProperties({
            trigger: 'input',
            value: true,
          }),
      );
    });

    should(`emit false if the value is false`, () => {
      run(_.el.getElement($.checkbox).pipe(
          tap(el => {
            el.indeterminate = false;
            el.checked = false;
          }),
      ));
      run(_.el.dispatchEvent($.checkbox._.onInput));

      assert(_.el.getObserver($.host._.value)).to.emitWith(
          objectThat<Value<boolean>>().haveProperties({
            trigger: 'input',
            value: false,
          }),
      );
    });

    should(`emit unknown if the value is indeterminate`, () => {
      run(_.el.getElement($.checkbox).pipe(
          tap(el => {
            el.indeterminate = true;
            el.checked = true;
          }),
      ));
      run(_.el.dispatchEvent($.checkbox._.onInput));

      assert(_.el.getObserver($.host._.value)).to.emitWith(
          objectThat<Value<CheckedValue>>().haveProperties({
            trigger: 'input',
            value: 'unknown',
          }),
      );
    });
  });
});
