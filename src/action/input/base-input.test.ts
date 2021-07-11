import {$stateService, source} from 'grapevine';
import {assert, createSpySubject, run, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {fakeStateService, MutableState, mutableState, ObjectPath} from 'gs-tools/export/state';
import {$div, attributeIn, attributeOut, booleanParser, dispatcher, element, host, PersonaContext, stringParser} from 'persona';
import {PersonaTesterFactory} from 'persona/export/testing';
import {EMPTY, Observable, of, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {_p} from '../../app/app';
import {objectPathParser} from '../../core/object-path-parser';
import {ChangeEvent, CHANGE_EVENT} from '../../event/change-event';

import {$baseInput as $baseInput, BaseInput, OBJECT_PATH_ATTR_NAME} from './base-input';


const $$ = {
  tag: 'mk-test-base-input',
  api: {
    ...$baseInput.api,
    stateId: attributeIn<ObjectPath<MutableState<string>>>(OBJECT_PATH_ATTR_NAME, objectPathParser()),
    onChange: dispatcher<ChangeEvent<string>>(CHANGE_EVENT),
  },
};
const $ = {
  div: element('div', $div, {
    disabled: attributeOut('disabled', booleanParser(), false),
    label: attributeOut('label', stringParser(), ''),
  }),
  host: host($$.api),
};

const $domValueId = source<ObjectPath<MutableState<string>>|null>(() => null);
const $domValueUpdatedByScript$ = source<Subject<unknown>>(() => new Subject());

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
        $.host._,
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

    return stateService.$(domValueId).pipe(filterNonNullable());
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

    return of(newValue).pipe(stateService.$(domValueId).set());
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/base-input', init => {
  const INIT_STATE_VALUE = 'INIT_STATE_VALUE';

  const _ = init(() => {
    const stateService = fakeStateService();
    const domValueId = stateService.addRoot(mutableState('init dom value'));
    const $domValue = stateService.mutablePath(domValueId);
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
    const {harness} = tester.createHarness(TestInput);

    const valueId = stateService.addRoot(mutableState(INIT_STATE_VALUE));
    const $value = stateService.mutablePath(valueId);
    harness.host._.stateId($value);

    // Clear the component to make test more predictable.
    harness.host._.clearFn([]);

    return {
      harness,
      onDomValueUpdatedByScript$,
      stateService,
      $domValue,
      $value,
    };
  });

  test('currentStateValue$', () => {
    should('emit the value corresponding to the state ID', () => {
      const value = 'value';
      run(of(value).pipe(_.stateService.$(_.$value).set()));

      _.harness.host._.clearFn([]);

      assert(_.stateService.$(_.$domValue)).to.emitWith(value);
    });

    should('emit the default value if state ID is not set', () => {
      _.harness.host._.stateId(undefined);

      _.harness.host._.clearFn([]);

      assert(_.stateService.$(_.$domValue)).to.emitWith(DEFAULT_VALUE);
    });
  });

  test('handleOnApply$', () => {
    should('set the new value of the state when the function is called', () => {
      const newDomValue = 'newDomValue';
      run(of(newDomValue).pipe(_.stateService.$(_.$domValue).set()));

      _.harness.host._.applyFn([]);

      assert(_.stateService.$(_.$value)).to.emitWith(newDomValue);
    });

    should('set the new value of the state on change', () => {
      const newDomValue = 'newDomValue';
      run(of(newDomValue).pipe(_.stateService.$(_.$domValue).set()));

      assert(_.stateService.$(_.$value)).to.emitWith(newDomValue);
    });

    should('do nothing if state ID is not specified', () => {
      _.harness.host._.stateId(undefined);
      const newDomValue = 'newDomValue';
      run(of(newDomValue).pipe(_.stateService.$(_.$domValue).set()));

      _.harness.host._.applyFn([]);

      assert(_.stateService.$(_.$value)).to.emitWith(INIT_STATE_VALUE);
    });
  });

  test('handleOnClear$', () => {
    should('set the state\'s value', () => {
      const newStateValue = 'newStateValue';
      run(of(newStateValue).pipe(_.stateService.$(_.$value).set()));

      const onDomValueUpdatedByScript$ = createSpySubject(_.onDomValueUpdatedByScript$);

      _.harness.host._.clearFn([]);

      assert(_.stateService.$(_.$domValue)).to.emitWith(newStateValue);
      assert(onDomValueUpdatedByScript$).to.emit();
    });

    should('set the default value at the start', () => {
      const onDomValueUpdatedByScript$ = createSpySubject(_.onDomValueUpdatedByScript$);

      assert(_.stateService.$(_.$domValue)).to.emitWith(INIT_STATE_VALUE);
      assert(onDomValueUpdatedByScript$).toNot.emit();
    });
  });

  test('onChange$', () => {
    should('emit the old value if dom value changes', () => {
      const eventValue$ = createSpySubject(_.harness.host._.onChange)
          .pipe(map(({oldValue}) => oldValue));

      run(of('newValue').pipe(_.stateService.$(_.$domValue).set()));

      assert(eventValue$).to.emitSequence([INIT_STATE_VALUE]);
    });

    should('not emit if the dom value does not change', () => {
      const newValue = 'newValue';
      run(of(newValue).pipe(_.stateService.$(_.$domValue).set()));

      const eventValue$ = createSpySubject(_.harness.host._.onChange)
          .pipe(map(({oldValue}) => oldValue));
      run(of(newValue).pipe(_.stateService.$(_.$domValue).set()));

      assert(eventValue$).to.emitSequence([]);
    });
  });
});
