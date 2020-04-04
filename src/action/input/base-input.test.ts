import { assert, setup, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, booleanParser, element, integerParser, PersonaContext, stringParser } from 'persona';
import { ElementTester, PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent, Observable } from 'rxjs';
import { switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { _p } from '../../app/app';

import { $$ as $baseInput, BaseInput } from './base-input';


const $ = {
  div: element('div', instanceofType(HTMLDivElement), {
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
  private readonly divEl$ = this.declareInput($.div);
  private readonly valueIn$ = this.declareInput($.div._.valueIn);

  constructor(context: PersonaContext) {
    super(
        $.host._.initValue,
        $.host._.value,
        $.div._.label,
        $.div._.disabled,
        context,
    );

    this.setupHandleValueInChange();
  }

  protected setupHandleValueInChange(): void {
    this.divEl$
        .pipe(
            switchMap(el => fromEvent(el, 'input')),
            withLatestFrom(this.valueIn$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, v]) => this.dirtyValue$.next(v));
  }

  protected setupUpdateValue(value$: Observable<number>): void {
    value$
        .pipe(
            $.div._.valueOut.output(this.shadowRoot),
            takeUntil(this.onDispose$),
        )
        .subscribe();
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
