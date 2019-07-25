import { assert, setup, should, test } from '@gs-testing';
import { InstanceofType } from '@gs-types';
import { attributeIn, attributeOut, element, InitFn } from '@persona';
import { ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { fromEvent, Observable } from '@rxjs';
import { switchMap, tap, withLatestFrom } from '@rxjs/operators';

import { _p } from '../../app/app';
import { booleanParser, integerParser, stringParser } from '../../util/parsers';

import { $$ as $baseInput, BaseInput } from './base-input';

const $ = {
  div: element('div', InstanceofType(HTMLDivElement), {
    disabled: attributeOut('disabled', booleanParser(), false),
    label: attributeOut('label', stringParser(), ''),
    valueIn: attributeIn('init-value', integerParser(), 0),
    valueOut: attributeOut('value', integerParser(), 0),
  }),
  host: element({
    ...$baseInput,
    initValue: attributeIn('init-value', integerParser(), 0),
    value: attributeOut('value', integerParser(), 0),
  }),
};

@_p.customElement({
  tag: 'mk-test-base-input',
  template: '<style id="theme"></style><div id="div"></div>',
})
class TestInput extends BaseInput<number> {
  private readonly divEl$ = _p.input($.div, this);
  private readonly valueIn$ = _p.input($.div._.valueIn, this);

  constructor(root: ShadowRoot) {
    super(
        $.host._.initValue,
        $.host._.value,
        $.div._.label,
        $.div._.disabled,
        root,
    );
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupHandleValueInChange(),
    ];
  }

  protected setupHandleValueInChange(): Observable<unknown> {
    return this.divEl$.pipe(
        switchMap(el => fromEvent(el, 'input')),
        withLatestFrom(this.valueIn$),
        tap(([, v]) => this.dirtyValue$.next(v)),
    );
  }

  protected setupUpdateValue(value$: Observable<number>): Observable<unknown> {
    return $.div._.valueOut.output(this.shadowRoot, value$);
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/base-input', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([TestInput]);
    el = tester.createElement('mk-test-base-input', document.body);
  });

  test('providesInitValue', () => {
    should(`set the initial value at the start`, () => {
      el.setAttribute($.host._.initValue, 123).subscribe();

      assert(el.getAttribute($.div._.valueOut)).to.emitWith(123);
    });

    should(`set the initial value after calling clear`, () => {
      el.setAttribute($.host._.initValue, 123).subscribe();

      // Set the dirty value.
      el.setAttribute($.div._.valueIn, 456).subscribe();

      // Clear the value
      el.callFunction($.host._.clearFn, []).subscribe();
      assert(el.getAttribute($.div._.valueOut)).to.emitWith(123);
    });
  });

  should(`render disabled status correctly`, () => {
    el.setHasAttribute($.host._.disabled, true).subscribe();

    assert(el.getAttribute($.div._.disabled)).to.emitWith(true);
  });

  should(`render the label correctly`, () => {
    const label = 'label';
    el.setAttribute($.host._.label, label).subscribe();

    assert(el.getAttribute($.div._.label)).to.emitWith(label);
  });
});
