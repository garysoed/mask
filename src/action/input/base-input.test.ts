import { source } from 'grapevine';
import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { attributeOut, booleanParser, element, host, integerParser, PersonaContext, stringParser } from 'persona';
import { PersonaTesterFactory } from 'persona/export/testing';
import { Observable, ReplaySubject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { _p } from '../../app/app';

import { $$ as $baseInput, BaseInput } from './base-input';


const $ = {
  div: element('div', instanceofType(HTMLDivElement), {
    disabled: attributeOut('disabled', booleanParser(), false),
    label: attributeOut('label', stringParser(), ''),
  }),
  host: host({
    ...$baseInput.api,
  }),
};

const $valueIn = source(() => new ReplaySubject<number>(1));
const $valueOut = source(() => new ReplaySubject<number>(1));

@_p.customElement({
  tag: 'mk-test-base-input',
  api: $baseInput.api,
  template: '<div id="div"></div>',
})
class TestInput extends BaseInput<number> {
  constructor(context: PersonaContext) {
    super(
        integerParser(),
        $.div._.label,
        $.div._.disabled,
        context,
    );

    this.addSetup(this.setupHandleValueChange());
  }

  protected setupHandleValueChange(): Observable<unknown> {
    return $valueIn.get(this.context.vine).pipe(
        switchMap(value$ => value$),
        tap(value => this.value$.next(value)),
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

  test('defaultValue$', () => {
    should(`ignore default values that cannot be parsed correctly`, () => {
      run(_.el.setAttribute($.host._.defaultValue, '123'));

      // Set the new default value.
      run(_.el.setAttribute($.host._.defaultValue, 'invalid'));

      // Clear the value
      run(_.el.callFunction($.host._.clearFn, []));
      assert(_.valueOut$).to.emitWith(123);
    });
  });

  test('setupHandleOnClear', () => {
    should(`set the default value after calling clear`, () => {
      run(_.el.setAttribute($.host._.defaultValue, '123'));

      // Set the new value.
      run(_.valueInService$.pipe(take(1), tap(value$ => value$.next(456))));

      // Clear the value
      run(_.el.callFunction($.host._.clearFn, []));
      assert(_.valueOut$).to.emitWith(123);
    });
  });

  should(`set the default value at the start`, () => {
    run(_.el.setAttribute($.host._.defaultValue, `123`));

    assert(_.valueOut$).to.emitWith(123);
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
