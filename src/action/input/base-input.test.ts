import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, booleanParser, element, integerParser, PersonaContext, stringParser } from 'persona';
import { PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent, Observable } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

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

    this.addSetup(this.setupHandleValueInChange());
  }

  protected setupHandleValueInChange(): Observable<unknown> {
    return this.divEl$
        .pipe(
            switchMap(el => fromEvent(el, 'input')),
            withLatestFrom(this.valueIn$),
            tap(([, v]) => this.dirtyValue$.next(v)),
        );
  }

  protected setupUpdateValue(value$: Observable<number>): Observable<unknown> {
    return value$.pipe($.div._.valueOut.output(this.shadowRoot));
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/base-input', init => {
  const _ = init(() => {
    const tester = testerFactory.build([TestInput], document);
    const el = tester.createElement('mk-test-base-input', document.body);
    return {el, tester};
  });

  test('providesInitValue', () => {
    should(`set the initial value at the start`, () => {
      run(_.el.setAttribute($.host._.initValue, 123));

      assert(_.el.getAttribute($.div._.valueOut)).to.emitWith(123);
    });

    should(`set the initial value after calling clear`, () => {
      run(_.el.setAttribute($.host._.initValue, 123));

      // Set the dirty value.
      run(_.el.setAttribute($.div._.valueIn, 456));

      // Clear the value
      run(_.el.callFunction($.host._.clearFn, []));
      assert(_.el.getAttribute($.div._.valueOut)).to.emitWith(123);
    });
  });

  should(`render disabled status correctly`, () => {
    run(_.el.setHasAttribute($.host._.disabled, true));

    assert(_.el.getAttribute($.div._.disabled)).to.emitWith(true);
  });

  should(`render the label correctly`, () => {
    const label = 'label';
    run(_.el.setAttribute($.host._.label, label));

    assert(_.el.getAttribute($.div._.label)).to.emitWith(label);
  });
});
