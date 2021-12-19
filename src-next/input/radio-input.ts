import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable, mapNullableTo} from 'gs-tools/export/rxjs';
import {nullType, numberType, unionType} from 'gs-types';
import {Context, iattr, id, ievent, INPUT, itarget, LABEL, oattr, oevent, otext, P, registerCustomElement} from 'persona';
import {oflag} from 'persona/src-next/output/flag';
import {combineLatest, concat, merge, Observable, OperatorFunction, pipe, Subject} from 'rxjs';
import {filter, map, mapTo, pairwise, shareReplay, skip, startWith, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';

import {$baseRootOutputs} from '../action/base-action';
import radioUnchecked from '../asset/checkbox_empty.svg';
import radioChecked from '../asset/radio_checked.svg';
import {registerSvg} from '../core/svg-service';
import {ICON} from '../display/icon';
import {ChangeEvent, CHANGE_EVENT} from '../event/change-event';
import {BaseInput, create$baseInput} from '../input/base-input';
import {LIST_ITEM_LAYOUT} from '../layout/list-item-layout';
import {renderTheme} from '../theme/render-theme';

import {$onRadioInput$} from './on-radio-input';
import template from './radio-input.html';


const $radioInput = {
  host: {
    ...create$baseInput(unionType([numberType, nullType]), null).host,
    index: iattr('index'),
    label: iattr('label'),
    namespace: iattr('namespace'),
    onChange: oevent(CHANGE_EVENT),
  },
  shadow: {
    container: id('container', LABEL, {
      ...$baseRootOutputs,
    }),
    icon: id('icon', ICON),
    input: id('input', INPUT, {
      element: itarget(),
      name: oattr('name'),
      onChange: ievent('change'),
      disabled: oflag('disabled'),
    }),
    label: id('label', P, {
      text: otext(),
    }),
  },
};

export class RadioInput extends BaseInput<number|null> {
  private readonly onDomValueUpdated$ = new Subject<void>();

  constructor(private readonly $: Context<typeof $radioInput>) {
    super($, $.shadow.input.disabled, $.shadow.container);
  }

  @cache()
  private get checkIcon$(): Observable<string> {
    return combineLatest([
      this.domValue$,
      this.index$,
    ])
        .pipe(
            map(([checkState, index]) => {
              return checkState === index ? 'mk.radio_checked' : 'mk.radio_unchecked';
            }),
        );
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      renderTheme(this.$),
      this.handleOnGlobalRadioInput$,
      this.handleOnRadioInput$,
      this.$.host.label.pipe(mapNullableTo(''), this.$.shadow.label.text()),
      this.checkIcon$.pipe(this.$.shadow.icon.icon()),
    ];
  }

  @cache()
  protected get domValue$(): Observable<number|null> {
    return merge(
        this.$.shadow.input.onChange,
        this.onDomValueUpdated$,
    )
        .pipe(
            startWith({}),
            withLatestFrom(this.$.shadow.input.element, this.index$),
            map(([, element, index]) => {
              if (index === null) {
                return null;
              }

              if (!(element instanceof HTMLInputElement)) {
                throw new Error('Element is not an HTMLInputElement');
              }

              return element.checked ? index : null;
            }),
            shareReplay({bufferSize: 1, refCount: true}),
        );
  }

  @cache()
  private get handleOnGlobalRadioInput$(): Observable<unknown> {
    return $onRadioInput$.get(this.$.vine).pipe(
        withLatestFrom(this.$.host.namespace, this.index$),
        filter(([event, namespace, index]) => {
          return event.index !== index && event.namespace === namespace;
        }),
        withLatestFrom(this.domValue$),
        filter(([, domValue]) => domValue !== null),
        mapTo(null),
        this.updateDomValue(),
        tap(() => {
          this.onDomValueUpdated$.next();
        }),
    );
  }

  @cache()
  private get handleOnRadioInput$(): Observable<unknown> {
    return this.domValue$
        .pipe(
            withLatestFrom(this.$.host.namespace, this.index$),
            tap(([currentValue, namespace, index]) => {
              if (!namespace || index === null) {
                return;
              }

              if (currentValue === null) {
                return;
              }

              $onRadioInput$.get(this.$.vine).next({index, namespace});
            }),
        );
  }

  @cache()
  private get index$(): Observable<number|null> {
    return this.$.host.index.pipe(
        map(index => {
          if (index === null) {
            return null;
          }

          const result = Number.parseInt(index, 10);
          return Number.isNaN(result) ? null : result;
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

  protected updateDomValue(): OperatorFunction<number|null, unknown> {
    return pipe(
        switchMap(value => {
          return this.index$.pipe(
              withLatestFrom(this.$.shadow.input.element),
              tap(([index, element]) => {
                if (!(element instanceof HTMLInputElement)) {
                  throw new Error('Element is not an HTMLInputElement');
                }

                element.checked = index !== null && value === index;
                this.onDomValueUpdated$.next();
              }),
          );
        }),
    );
  }
}

export const RADIO_INPUT = registerCustomElement({
  ctrl: RadioInput,
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
  deps: [
    ICON,
    LIST_ITEM_LAYOUT,
  ],
  spec: $radioInput,
  tag: 'mk-radio-input',
  template,
});