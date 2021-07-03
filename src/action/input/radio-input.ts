import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {$input, $label, $p, attributeIn, attributeOut, classlist, dispatcher, element, host, integerParser, onInput, PersonaContext, setAttribute, stringParser, textOut} from 'persona';
import {concat, EMPTY, merge, Observable} from 'rxjs';
import {filter, map, pairwise, shareReplay, skip, startWith, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';

import {_p} from '../../app/app';
import radioUnchecked from '../../asset/checkbox_empty.svg';
import radioChecked from '../../asset/radio_checked.svg';
import {stateIdParser} from '../../core/state-id-parser';
import {registerSvg} from '../../core/svg-service';
import {Icon} from '../../display/icon';
import {ChangeEvent, CHANGE_EVENT} from '../../event/change-event';
import {ListItemLayout} from '../../layout/list-item-layout';
import {$baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME} from '../input/base-input';

import {$onRadioInput$} from './on-radio-input';
import template from './radio-input.html';


export const $radioInput = {
  api: {
    ...$baseInput.api,
    label: attributeIn('label', stringParser(), ''),
    onChange: dispatcher<ChangeEvent<number|null>>(CHANGE_EVENT),
    stateId: attributeIn(STATE_ID_ATTR_NAME, stateIdParser<number|null>()),
    index: attributeIn('index', integerParser()),
  },
  tag: 'mk-radio-input',
};

export const $ = {
  checkedLabel: element('checkedLabel', $p, {
    text: textOut(),
  }),
  container: element('container', $label, {
    checkMode: classlist(),
  }),
  host: host({
    ...$radioInput.api,
  }),
  input: element('input', $input, {
    name: attributeOut('name', stateIdParser<number|null>()),
    onInput: onInput(),
    disabled: setAttribute('disabled'),
  }),
  uncheckedLabel: element('uncheckedLabel', $p, {
    text: textOut(),
  }),
};

@_p.customElement({
  ...$radioInput,
  template,
  dependencies: [
    Icon,
    ListItemLayout,
  ],
  configure(vine: Vine): void {
    registerSvg(
        vine,
        'mk.radio_checked',
        {type: 'embed', content: radioChecked},
    );
    registerSvg(
        vine,
        'mk.radio_unchecked',
        {type: 'embed', content: radioUnchecked},
    );
  },
})
export class RadioInput extends BaseInput<number|null, typeof $> {
  constructor(context: PersonaContext) {
    super(
        null,
        $.input._.disabled,
        $.host._.stateId,
        $.host._.onChange,
        context,
        $,
        $.host._,
    );

    this.addSetup(this.handleOnGlobalRadioInput$);
    this.addSetup(this.handleOnRadioInput$);
  }

  @cache()
  private get checkMode$(): Observable<ReadonlySet<string>> {
    return this.domValue$.pipe(
        withLatestFrom(this.inputs.host.index),
        map(([checkState, index]) => {
          return checkState === index ? 'display_checked' : 'display_unchecked';
        }),
        map(classname => new Set([classname])),
    );
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.renders,
      this.renderers.container.checkMode(this.checkMode$),
      this.renderers.input.name(this.inputs.host.stateId.pipe(filterNonNullable())),
      this.renderers.checkedLabel.text(this.inputs.host.label),
      this.renderers.uncheckedLabel.text(this.inputs.host.label),
    ];
  }

  @cache()
  protected get domValue$(): Observable<number|null> {
    return merge(
        this.inputs.input.onInput,
        this.onDomValueUpdatedByScript$,
    )
        .pipe(
            startWith({}),
            withLatestFrom(this.inputs.host.index),
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
        withLatestFrom(this.inputs.host.stateId, this.inputs.host.index),
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
        this.inputs.input.onInput,
        this.onDomValueUpdatedByScript$,
    )
        .pipe(
            withLatestFrom(
                this.domValue$,
                this.inputs.host.stateId,
                this.inputs.host.index,
            ),
            tap(([, currentValue, stateId, index]) => {
              if (!stateId || index === undefined) {
                return;
              }

              if (currentValue === null) {
                return;
              }

              $onRadioInput$.get(this.vine).next({index, stateId});
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
        onChange$.pipe(skip(1), filterNonNullable()),
    );
  }

  protected updateDomValue(newValue: number|null): Observable<unknown> {
    return this.inputs.host.index.pipe(
        take(1),
        tap(index => {
          const el = $.input.getSelectable(this.context);
          el.checked = index !== undefined && newValue === index;
        }),
    );
  }
}
