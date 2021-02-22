import {source} from 'grapevine';
import {assert, createSpySubject, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {instanceofType} from 'gs-types';
import {attributeIn, attributeOut, booleanParser, dispatcher, element, host, PersonaContext, stringParser} from 'persona';
import {PersonaTesterFactory} from 'persona/export/testing';
import {EMPTY, Observable, of, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {_p} from '../../app/app';
import {stateIdParser} from '../../core/state-id-parser';
import {$stateService} from '../../core/state-service';
import {ChangeEvent, CHANGE_EVENT} from '../../event/change-event';

import {$baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME} from './base-input';


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
const $domValueUpdatedByScript$ = source<Subject<unknown>>(
    'domValueUpdatedByScript$',
    () => new Subject(),
);

const DEFAULT_VALUE = 'DEFAULT_VALUE';

@_p.customElement({
  ...$$,
  template: '<div id="div"></div>',
})
class TestInput extends BaseInput<string, typeof $> {
  constructor(context: PersonaContext) {
    super(
        DEFAULT_VALUE,
        $.div._.disabled,
        $.host._.stateId,
        $.host._.onChange,
        context,
        $,
    );

    this.addSetup(this.forwardDomValueUpdatedByScript$);
  }

  @cache()
  protected get domValue$(): Observable<string> {
    const stateService = $stateService.get(this.vine);
    const domValueId = $domValueId.get(this.vine);
    if (!domValueId) {
      return EMPTY;
    }

    return stateService.resolve(domValueId).pipe(filterNonNullable());
  }

  @cache()
  protected get forwardDomValueUpdatedByScript$(): Observable<unknown> {
    return this.onDomValueUpdatedByScript$.pipe(
        tap(event => {
          $domValueUpdatedByScript$.get(this.vine).next(event);
        }),
    );
  }

  protected updateDomValue(newValue: string): Observable<unknown> {
    const stateService = $stateService.get(this.vine);
    const domValueId = $domValueId.get(this.vine);
    if (!domValueId) {
      return EMPTY;
    }

    stateService.set(domValueId, newValue);
    return of({});
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/base-input', init => {
  const INIT_STATE_VALUE = 'INIT_STATE_VALUE';

  const _ = init(() => {
    const stateService = fakeStateService();
    const $domValue = stateService.add('init dom value');
    const onDomValueUpdatedByScript$ = new Subject<unknown>();
    const tester = testerFactory.build({
      overrides: [
        {override: $stateService, withValue: stateService},
        {override: $domValueId, withValue: $domValue},
        {override: $domValueUpdatedByScript$, withValue: onDomValueUpdatedByScript$},
      ],
      rootCtrls: [TestInput],
      rootDoc: document,
    });
    const el = tester.createElement('mk-test-base-input');

    const $value = stateService.add(INIT_STATE_VALUE);
    el.setAttribute($.host._.stateId, $value);

    // Clear the component to make test more predictable.
    el.callFunction($.host._.clearFn, []);

    return {
      el,
      onDomValueUpdatedByScript$,
      stateService,
      $domValue,
      $value,
    };
  });

  test('currentStateValue$', () => {
    should('emit the value corresponding to the state ID', () => {
      const value = 'value';
      _.stateService.set(_.$value, value);

      _.el.callFunction($.host._.clearFn, []);

      assert(_.stateService.resolve(_.$domValue)).to.emitWith(value);
    });

    should('emit the default value if state ID is not set', () => {
      _.el.element.setAttribute($.host._.stateId.attrName, '');

      _.el.callFunction($.host._.clearFn, []);

      assert(_.stateService.resolve(_.$domValue)).to.emitWith(DEFAULT_VALUE);
    });
  });

  test('handleOnApply$', () => {
    should('set the new value of the state when the function is called', () => {
      const newDomValue = 'newDomValue';
      _.stateService.set(_.$domValue, newDomValue);

      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.resolve(_.$value)).to.emitWith(newDomValue);
    });

    should('set the new value of the state on change if apply-on-change is true', () => {
      _.el.setHasAttribute($.host._.applyOnChange, true);

      const newDomValue = 'newDomValue';
      _.stateService.set(_.$domValue, newDomValue);

      assert(_.stateService.resolve(_.$value)).to.emitWith(newDomValue);
    });

    should('not set the new value on change if apply-on-change is false', () => {
      const newDomValue = 'newDomValue';
      _.stateService.set(_.$domValue, newDomValue);

      assert(_.stateService.resolve(_.$value)).to.emitWith(INIT_STATE_VALUE);
    });

    should('do nothing if state ID is not specified', () => {
      _.el.element.setAttribute($.host._.stateId.attrName, '');
      const newDomValue = 'newDomValue';
      _.stateService.set(_.$domValue, newDomValue);

      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.resolve(_.$value)).to.emitWith(INIT_STATE_VALUE);
    });
  });

  test('handleOnClear$', () => {
    should('set the state\'s value', () => {
      const newStateValue = 'newStateValue';
      _.stateService.set(_.$value, newStateValue);

      const onDomValueUpdatedByScript$ = createSpySubject(_.onDomValueUpdatedByScript$);

      _.el.callFunction($.host._.clearFn, []);

      assert(_.stateService.resolve(_.$domValue)).to.emitWith(newStateValue);
      assert(onDomValueUpdatedByScript$).to.emit();
    });

    should('set the default value at the start', () => {
      const onDomValueUpdatedByScript$ = createSpySubject(_.onDomValueUpdatedByScript$);

      assert(_.stateService.resolve(_.$domValue)).to.emitWith(INIT_STATE_VALUE);
      assert(onDomValueUpdatedByScript$).toNot.emit();
    });
  });

  test('onChange$', () => {
    should('emit the old value if dom value changes', () => {
      const eventValue$ = createSpySubject(_.el.getEvents($.host._.onChange))
          .pipe(map(({oldValue}) => oldValue));

      _.stateService.set(_.$domValue, 'newValue');

      assert(eventValue$).to.emitSequence([INIT_STATE_VALUE]);
    });

    should('not emit if the dom value does not change', () => {
      const newValue = 'newValue';
      _.stateService.set(_.$domValue, newValue);

      const eventValue$ = createSpySubject(_.el.getEvents($.host._.onChange))
          .pipe(map(({oldValue}) => oldValue));
      _.stateService.set(_.$domValue, newValue);

      assert(eventValue$).to.emitSequence([]);
    });
  });
});
