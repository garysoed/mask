import { EMPTY, Observable, concat, merge } from 'rxjs';
import { Logger } from 'santa';
import { PersonaContext, attributeIn, attributeOut, dispatcher, element, host, integerParser, onInput, setAttribute, stringParser } from 'persona';
import { cache } from 'gs-tools/export/data';
import { filter, map, pairwise, shareReplay, skip, startWith, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { filterDefined, filterNonNull } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';

import { $baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME } from '../input/base-input';
import { CHANGE_EVENT, ChangeEvent } from '../../event/change-event';
import { _p } from '../../app/app';
import { stateIdParser } from '../../core/state-id-parser';

import { $onRadioInput$ } from './on-radio-input';
import template from './radio-input.html';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    return this.domValue$.pipe(
        withLatestFrom(this.declareInput($.host._.index)),
        map(([checkState, index]) => {
          return checkState === index ? 'display_checked' : 'display_unchecked';
        }),
    );
  }

  @cache()
  protected get domValue$(): Observable<number|null> {
    return merge(
        this.declareInput($.input._.onInput),
        this.onDomValueUpdatedByScript$,
    )
        .pipe(
            startWith({}),
            withLatestFrom(this.declareInput($.host._.index)),
            map(([, index]) => {
              const element = $.input.getSelectable(this.context);
              if (index === undefined) {
                return null;
              }

              return element.checked ? index : null;
            }),
            shareReplay({bufferSize: 1, refCount: true}),
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
        withLatestFrom(this.domValue$),
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
                this.domValue$,
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
  protected get onChange$(): Observable<ChangeEvent<number|null>> {
    const onChange$ = this.domValue$.pipe(
        pairwise(),
        filter(([oldValue, newValue]) => oldValue !== newValue),
        map(([oldValue]) => new ChangeEvent(oldValue)),
    );

    return concat(
        onChange$.pipe(take(1)),
        onChange$.pipe(skip(1), filterNonNull()),
    );
  }

  protected updateDomValue(newValue: number|null): Observable<unknown> {
    return this.declareInput($.host._.index).pipe(
        take(1),
        tap(index => {
          const el = $.input.getSelectable(this.context);
          el.checked = index !== undefined && newValue === index;
        }),
    );
  }
}
