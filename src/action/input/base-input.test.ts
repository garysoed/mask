import { source } from 'grapevine';
import { assert, createSpySubject, objectThat, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, booleanParser, element, emitter, host, integerParser, PersonaContext, stringParser } from 'persona';
import { PersonaTesterFactory } from 'persona/export/testing';
import { Observable, ReplaySubject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { _p } from '../../app/app';

import { $baseInput as $baseInput, BaseInput, DEFAULT_VALUE_ATTR_NAME, Value, VALUE_PROPERTY_NAME } from './base-input';

const $$ = {
  tag: 'mk-test-base-input',
  api: {
    ...$baseInput.api,
    defaultValue: attributeIn(DEFAULT_VALUE_ATTR_NAME, integerParser(), 0),
    value: emitter<Value<number>>(VALUE_PROPERTY_NAME),
  },
};
const $ = {
  div: element('div', instanceofType(HTMLDivElement), {
    disabled: attributeOut('disabled', booleanParser(), false),
    label: attributeOut('label', stringParser(), ''),
  }),
  host: host($$.api),
};

const $valueIn = source('valueIn', () => new ReplaySubject<number>(1));
const $valueOut = source('valueOut', () => new ReplaySubject<number>(1));

@_p.customElement({
  ...$$,
  template: '<div id="div"></div>',
})
class TestInput extends BaseInput<number> {
  constructor(context: PersonaContext) {
    super(
        $.host._.defaultValue,
        $.div._.disabled,
        $.div._.label,
        $.host._.value,
        context,
    );

    this.addSetup(this.setupHandleValueChange());
  }

  protected setupHandleValueChange(): Observable<unknown> {
    return $valueIn.get(this.context.vine).pipe(
        switchMap(value$ => value$),
        tap(value => this.onInputValue$.next(value)),
    );
  }

  protected updateDomValue(newValue: number): Observable<unknown> {
    return $valueOut.get(this.context.vine).pipe(
        take(1),
        tap(value$ => {
          value$.next(newValue);
        }),
    );
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/base-input', init => {
  const _ = init(() => {
    const tester = testerFactory.build([TestInput], document);
    const el = tester.createElement('mk-test-base-input');
    const valueOut$ = $valueOut.get(tester.vine).pipe(switchMap(value$ => value$));
    const valueInService$ = $valueIn.get(tester.vine);
    return {el, tester, valueInService$, valueOut$};
  });

  test('setupHandleOnClear', () => {
    should(`set the default value after calling clear`, () => {
      const value$ = createSpySubject(_.el.getObserver($.host._.value));
      run(_.el.setAttribute($.host._.defaultValue, 123));
      run(_.el.callFunction($.host._.clearFn, []));

      // Set the new value.
      run(_.valueInService$.pipe(take(1), tap(value$ => value$.next(456))));

      // Clear the value
      run(_.el.callFunction($.host._.clearFn, []));
      assert(_.valueOut$).to.emitWith(123);
      assert(value$).to.emitWith(objectThat<Value<number>>().haveProperties({
        trigger: 'default',
        value: 123,
      }));
    });
  });

  test('setForwardInputValue', () => {
    should(`emit the correct value for value observable`, () => {
      const value$ = createSpySubject(_.el.getObserver($.host._.value));
      run($valueIn.get(_.tester.vine).pipe(
          tap(subject => {
            subject.next(123);
          }),
      ));

      assert(value$).to.emitWith(objectThat<Value<number>>().haveProperties({
        trigger: 'input',
        value: 123,
      }));
    });
  });

  should(`set the default value at the start`, () => {
    const value$ = createSpySubject(_.el.getObserver($.host._.value));
    run(_.el.setAttribute($.host._.defaultValue, 123));
    run(_.el.callFunction($.host._.clearFn, []));

    assert(_.valueOut$).to.emitWith(123);
    assert(value$).to.emitWith(objectThat<Value<number>>().haveProperties({
      trigger: 'default',
      value: 123,
    }));
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
