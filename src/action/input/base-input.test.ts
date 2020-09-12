import { source } from 'grapevine';
import { assert, createSpySubject, run, should, test } from 'gs-testing';
import { cache } from 'gs-tools/export/data';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { StateId, StateService } from 'gs-tools/export/state';
import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, booleanParser, dispatcher, element, host, PersonaContext, stringParser } from 'persona';
import { PersonaTesterFactory } from 'persona/export/testing';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { _p } from '../../app/app';
import { stateIdParser } from '../../core/state-id-parser';
import { $stateService } from '../../core/state-service';
import { CHANGE_EVENT, ChangeEvent } from '../../event/change-event';

import { $baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME } from './base-input';


const $$ = {
  tag: 'mk-test-base-input',
  api: {
    ...$baseInput.api,
    stateId: attributeIn<StateId<string>>(STATE_ID_ATTR_NAME, stateIdParser()),
    onChange: dispatcher<ChangeEvent<string>>(CHANGE_EVENT),
  },
};
const $ = {
  div: element('div', instanceofType(HTMLDivElement), {
    disabled: attributeOut('disabled', booleanParser(), false),
    label: attributeOut('label', stringParser(), ''),
  }),
  host: host($$.api),
};

const $domValueId = source<StateId<string>|null>('domValueId', () => null);

const DEFAULT_VALUE = 'DEFAULT_VALUE';

@_p.customElement({
  ...$$,
  template: '<div id="div"></div>',
})
class TestInput extends BaseInput<string> {
  constructor(context: PersonaContext) {
    super(
        DEFAULT_VALUE,
        $.div._.disabled,
        $.host._.stateId,
        $.host._.onChange,
        context,
    );
  }

  @cache()
  protected get domValue$(): Observable<string> {
    return combineLatest([
      $stateService.get(this.vine),
      $domValueId.get(this.vine),
    ])
    .pipe(
        switchMap(([stateService, domValueId]) => {
          if (!domValueId) {
            return observableOf(null);
          }

          return stateService.get(domValueId);
        }),
        filterNonNull(),
    );
  }

  protected updateDomValue(newValue: string): Observable<unknown> {
    return combineLatest([
      $stateService.get(this.vine),
      $domValueId.get(this.vine),
    ])
    .pipe(
        tap(([stateService, domValueId]) => {
          if (!domValueId) {
            return;
          }

          stateService.set(domValueId, newValue);
        }),
    );
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/base-input', init => {
  const INIT_STATE_VALUE = 'INIT_STATE_VALUE';

  const _ = init(() => {
    const tester = testerFactory.build([TestInput], document);
    const el = tester.createElement('mk-test-base-input');

    const stateService = new StateService();
    $stateService.set(tester.vine, () => stateService);

    const $value = stateService.add(INIT_STATE_VALUE);
    run(el.setAttribute($.host._.stateId, $value));

    const $domValue = stateService.add('init dom value');
    $domValueId.set(tester.vine, () => $domValue);

    // Clear the component to make test more predictable.
    run(el.callFunction($.host._.clearFn, []));

    return {el, stateService, $domValue, $value};
  });

  test('currentStateValue$', () => {
    should(`emit the value corresponding to the state ID`, () => {
      const value = 'value';
      _.stateService.set(_.$value, value);

      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.stateService.get(_.$domValue)).to.emitWith(value);
    });

    should(`emit the default value if state ID is not set`, () => {
      run(_.el.getElement($.host).pipe(
          tap(element => {
            element.setAttribute($.host._.stateId.attrName, '');
          }),
      ));

      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.stateService.get(_.$domValue)).to.emitWith(DEFAULT_VALUE);
    });
  });

  test('handleOnApply$', () => {
    should(`set the new value of the state when the function is called`, () => {
      const newDomValue = 'newDomValue';
      _.stateService.set(_.$domValue, newDomValue);

      run(_.el.callFunction($.host._.applyFn, []));

      assert(_.stateService.get(_.$value)).to.emitWith(newDomValue);
    });

    should(`set the new value of the state on change if apply-on-change is true`, () => {
      run(_.el.setAttribute($.host._.applyOnChange, true));

      const newDomValue = 'newDomValue';
      _.stateService.set(_.$domValue, newDomValue);

      assert(_.stateService.get(_.$value)).to.emitWith(newDomValue);
    });

    should(`not set the new value on change if apply-on-change is false`, () => {
      const newDomValue = 'newDomValue';
      _.stateService.set(_.$domValue, newDomValue);

      assert(_.stateService.get(_.$value)).to.emitWith(INIT_STATE_VALUE);
    });

    should(`do nothing if state ID is not specified`, () => {
      run(_.el.getElement($.host).pipe(
          tap(element => {
            element.setAttribute($.host._.stateId.attrName, '');
          }),
      ));
      const newDomValue = 'newDomValue';
      _.stateService.set(_.$domValue, newDomValue);

      run(_.el.callFunction($.host._.applyFn, []));

      assert(_.stateService.get(_.$value)).to.emitWith(INIT_STATE_VALUE);
    });
  });

  test('handleOnClear$', () => {
    should(`set the state's value`, () => {
      const newStateValue = 'newStateValue';
      _.stateService.set(_.$value, newStateValue);

      run(_.el.callFunction($.host._.clearFn, []));

      assert(_.stateService.get(_.$domValue)).to.emitWith(newStateValue);
    });

    should(`set the default value at the start`, () => {
      assert(_.stateService.get(_.$domValue)).to.emitWith(INIT_STATE_VALUE);
    });
  });

  test('onChange$', () => {
    should(`emit the old value if dom value changes`, () => {
      const eventValue$ = createSpySubject(_.el.getEvents($.host._.onChange))
          .pipe(map(({oldValue}) => oldValue));

      _.stateService.set(_.$domValue, 'newValue');

      assert(eventValue$).to.emitSequence([INIT_STATE_VALUE]);
    });

    should(`not emit if the dom value does not change`, () => {
      const newValue = 'newValue';
      _.stateService.set(_.$domValue, newValue);

      const eventValue$ = createSpySubject(_.el.getEvents($.host._.onChange))
          .pipe(map(({oldValue}) => oldValue));
      _.stateService.set(_.$domValue, newValue);

      assert(eventValue$).to.emitSequence([]);
    });
  });
});
