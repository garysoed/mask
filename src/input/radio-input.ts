import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable, mapNullableTo} from 'gs-tools/export/rxjs';
import {nullType, stringType, unionType} from 'gs-types';
import {Context, iattr, ievent, INPUT, itarget, LABEL, oattr, oevent, oflag, otext, P, query, registerCustomElement} from 'persona';
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


export const $radioInput = {
  host: {
    ...create$baseInput<string|null>(unionType([stringType, nullType]), null).host,
    key: iattr('key'),
    label: iattr('label'),
    group: iattr('group'),
    onChange: oevent(CHANGE_EVENT, ChangeEvent),
  },
  shadow: {
    container: query('#container', LABEL, {
      ...$baseRootOutputs,
    }),
    icon: query('#icon', ICON),
    input: query('#input', INPUT, {
      element: itarget(),
      name: oattr('name'),
      onChange: ievent('change', Event),
      disabled: oflag('disabled'),
    }),
    label: query('#label', P, {
      text: otext(),
    }),
  },
};

export class RadioInput extends BaseInput<string|null> {
  private readonly onDomValueUpdated$ = new Subject<void>();

  constructor(private readonly $: Context<typeof $radioInput>) {
    super($, $.shadow.input.disabled, $.shadow.container);
  }

  @cache()
  private get checkIcon$(): Observable<string> {
    return combineLatest([
      this.domValue$,
      this.$.host.key,
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
  protected get domValue$(): Observable<string|null> {
    return merge(
        this.$.shadow.input.onChange,
        this.onDomValueUpdated$,
    )
        .pipe(
            startWith({}),
            withLatestFrom(this.$.shadow.input.element, this.$.host.key),
            map(([, element, key]) => {
              if (!key) {
                return null;
              }

              if (!(element instanceof HTMLInputElement)) {
                throw new Error('Element is not an HTMLInputElement');
              }

              return element.checked ? key : null;
            }),
            shareReplay({bufferSize: 1, refCount: true}),
        );
  }

  @cache()
  private get handleOnGlobalRadioInput$(): Observable<unknown> {
    return $onRadioInput$.get(this.$.vine).pipe(
        withLatestFrom(this.$.host.group, this.$.host.key),
        filter(([event, namespace, key]) => {
          return event.key !== key && event.group === namespace;
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
            withLatestFrom(this.$.host.group, this.$.host.key),
            tap(([currentValue, group, key]) => {
              if (!group || !key) {
                return;
              }

              if (currentValue === null) {
                return;
              }

              $onRadioInput$.get(this.$.vine).next({key, group});
            }),
        );
  }

  @cache()
  protected get onChange$(): Observable<ChangeEvent<string|null>> {
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

  protected updateDomValue(): OperatorFunction<string|null, unknown> {
    return pipe(
        switchMap(value => {
          return this.$.host.key.pipe(
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
