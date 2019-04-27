import { assert, setup, should, test } from '@gs-testing';
import { attributeIn, attributeOut, element } from '@persona';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { InstanceofType } from 'gs-types/export';
import { Observable, of as observableOf } from 'rxjs';
import { _p } from '../../app/app';
import { booleanParser, integerParser, stringParser } from '../../util/parsers';
import { $$ as $baseInput, BaseInput } from './base-input';

const $ = {
  div: element('div', InstanceofType(HTMLDivElement), {
    disabled: attributeOut('disabled', booleanParser(), false),
    label: attributeOut('label', stringParser(), ''),
    valueIn: attributeIn('value', integerParser(), 0),
    valueOut: attributeOut('value', integerParser(), 0),
  }),
  host: element({
    ...$baseInput,
    initValue: attributeIn('init-value', integerParser(), 0),
  }),
};

@_p.customElement({
  tag: 'mk-test',
  template: '<style id="theme"></style><div id="div"></div>',
})
class TestInput extends BaseInput<number> {
  private readonly initValue = _p.input($.host._.initValue, this);
  private readonly valueIn = _p.input($.div._.valueIn, this);

  constructor(root: ShadowRoot) {
    super(
        $.div._.disabled,
        $.div._.label,
        $.div._.valueOut,
        root,
    );
  }

  getCurrentValueObs(): Observable<number> {
    return this.valueIn;
  }

  getInitValueObs(): Observable<number> {
    return this.initValue;
  }

  updateCurrentValue(value: number): Observable<unknown> {
    return $.div._.valueOut.output(this.shadowRoot, observableOf(value));
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/base-input', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([TestInput]);
    el = tester.createElement('mk-test', document.body);
  });

  test('providesInitValue', () => {
    should(`set the initial value at the start`, async () => {
      tester.setAttribute(el, $.host._.initValue, 123).subscribe();

      await assert(tester.getAttribute(el, $.div._.valueOut)).to.emitWith(123);
    });

    should(`set the initial value after calling clear`, async () => {
      tester.setAttribute(el, $.host._.initValue, 123).subscribe();

      // Set the dirty value.
      tester.setAttribute(el, $.div._.valueIn, 456).subscribe();

      // Clear the value
      tester.callFunction(el, $.host._.clearFn, []).subscribe();
      await assert(tester.getAttribute(el, $.div._.valueOut)).to.emitWith(123);
    });
  });

  should(`render disabled status correctly`, async () => {
    tester.setHasAttribute(el, $.host._.disabled, true).subscribe();

    await assert(tester.getAttribute(el, $.div._.disabled)).to.emitWith(true);
  });

  should(`render the label correctly`, async () => {
    const label = 'label';
    tester.setAttribute(el, $.host._.label, label).subscribe();

    await assert(tester.getAttribute(el, $.div._.label)).to.emitWith(label);
  });
});
