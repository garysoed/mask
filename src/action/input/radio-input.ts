import { cache } from 'gs-tools/export/data';
import { debug, filterDefined, filterNonNull } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, dispatcher, element, host, integerParser, onInput, PersonaContext, setAttribute, stringParser } from 'persona';
import { concat, EMPTY, merge, Observable } from 'rxjs';
import { filter, map, startWith, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import { _p } from '../../app/app';
import { stateIdParser } from '../../core/state-id-parser';
import { CHANGE_EVENT, ChangeEvent } from '../../event/change-event';
import { $baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME } from '../input/base-input';

import { $onRadioInput$ } from './on-radio-input';
import template from './radio-input.html';


const LOGGER = new Logger('mask.RadioInput');


export const $radioInput = {
  api: {
    ...$baseInput.api,
    onChange: dispatcher<ChangeEvent<number|null>>(CHANGE_EVENT),
    stateId: attributeIn(STATE_ID_ATTR_NAME, stateIdParser<number|null>()),
    index: attributeIn('index', integerParser()),
  },
  tag: 'mk-radio-input',
};

export const $ = {
  display: element('display', instanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
  host: host({
    ...$radioInput.api,
  }),
  input: element('input', instanceofType(HTMLInputElement), {
    name: attributeOut('name', stateIdParser<number|null>()),
    onInput: onInput(),
    disabled: setAttribute('disabled'),
  }),
};

@_p.customElement({
  ...$radioInput,
  template,
})
export class RadioInput extends BaseInput<number|null> {
  constructor(context: PersonaContext) {
    super(
        null,
        $.input._.disabled,
        $.host._.stateId,
        $.host._.onChange,
        context,
    );

    this.addSetup(this.handleOnGlobalRadioInput$);
    this.addSetup(this.handleOnRadioInput$);
    this.render($.display._.name, this.displaySlot$);
    this.render($.input._.name, this.declareInput($.host._.stateId).pipe(filterDefined()));
  }

  @cache()
  private get displaySlot$(): Observable<string> {
    return this.nullableDomValue$.pipe(
        withLatestFrom(this.declareInput($.host._.index)),
        map(([checkState, index]) => {
          return checkState === index ? 'display_checked' : 'display_unchecked';
        }),
    );
  }

  @cache()
  protected get domValue$(): Observable<number|null> {
    return concat(
        this.nullableDomValue$.pipe(take(1)),
        this.nullableDomValue$.pipe(filterNonNull()),
    );
  }

  @cache()
  private get handleOnGlobalRadioInput$(): Observable<unknown> {
    return $onRadioInput$.get(this.vine).pipe(
        switchMap(subject => subject),
        withLatestFrom(this.declareInput($.host._.stateId), this.declareInput($.host._.index)),
        filter(([event, stateId, index]) => {
          return event.index !== index && event.stateId.id === stateId?.id;
        }),
        withLatestFrom(this.nullableDomValue$),
        switchMap(([, domValue]) => {
          if (domValue === null) {
            return EMPTY;
          }
          return this.updateDomValue(null).pipe(
              tap(() => {
                this.onDomValueUpdatedByScript$.next();
              }),
          );
        }),
    );
  }

  @cache()
  private get handleOnRadioInput$(): Observable<unknown> {
    return merge(
        this.declareInput($.input._.onInput),
        this.onDomValueUpdatedByScript$,
    )
    .pipe(
      withLatestFrom(
          this.nullableDomValue$,
          this.declareInput($.host._.stateId),
          this.declareInput($.host._.index),
          $onRadioInput$.get(this.vine),
      ),
      tap(([, currentValue, stateId, index, subject]) => {
        if (!stateId || index === undefined) {
          return;
        }

        if (currentValue === null) {
          return;
        }
        subject.next({index, stateId});
      }),
    );
  }

  @cache()
  private get nullableDomValue$(): Observable<number|null> {
    return merge(
        this.declareInput($.input._.onInput),
        this.onDomValueUpdatedByScript$,
    )
    .pipe(
        startWith({}),
        withLatestFrom(this.declareInput($.host._.index)),
        map(([, index]) => {
          const element = $.input.getElement(this.context);
          if (index === undefined) {
            return null;
          }

          return element.checked ? index : null;
        }),
        debug(LOGGER, 'nullableValue'),
    );
  }

  protected updateDomValue(newValue: number|null): Observable<unknown> {
    return this.declareInput($.host._.index).pipe(
        take(1),
        tap(index => {
          const el = $.input.getElement(this.context);
          el.checked = index !== undefined && newValue === index;
        }),
    );
  }
}
