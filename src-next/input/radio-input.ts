import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable, mapNullableTo} from 'gs-tools/export/rxjs';
import {MutableResolver} from 'gs-tools/export/state';
import {nullType, stringType, unionType} from 'gs-types';
import {Bindings, Context, iattr, id, ievent, INPUT, itarget, LABEL, oattr, oevent, otext, P, registerCustomElement} from 'persona';
import {ReversedSpec} from 'persona/export/internal';
import {oflag} from 'persona/src-next/output/flag';
import {combineLatest, concat, merge, Observable, OperatorFunction, pipe, Subject} from 'rxjs';
import {filter, map, mapTo, pairwise, shareReplay, skip, startWith, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';

import {$baseRootOutputs} from '../action/base-action';
import radioUnchecked from '../asset/checkbox_empty.svg';
import radioChecked from '../asset/radio_checked.svg';
import {registerSvg} from '../core/svg-service';
import {ICON} from '../display/icon';
import {ActionEvent} from '../event/action-event';
import {ChangeEvent, CHANGE_EVENT} from '../event/change-event';
import {BaseInput, create$baseInput} from '../input/base-input';
import {LIST_ITEM_LAYOUT} from '../layout/list-item-layout';
import {renderTheme} from '../theme/render-theme';

import {$onRadioInput$, OnRadioInput} from './on-radio-input';
import template from './radio-input.html';


const $radioInput = {
  host: {
    ...create$baseInput(unionType([stringType, nullType]), null).host,
    key: iattr('key'),
    label: iattr('label'),
    group: iattr('group'),
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

export class RadioInput extends BaseInput<string|null, OnRadioInput> {
  private readonly onDomValueUpdated$ = new Subject<void>();

  constructor(private readonly $: Context<typeof $radioInput>) {
    super($, $.shadow.input.disabled, $.shadow.container);
  }

  @cache()
  get onAction$(): Observable<ActionEvent<OnRadioInput>> {
    return combineLatest([
      this.$.host.key,
      this.$.host.group,
      this.domValue$,
    ])
        .pipe(
            map(([key, group, value]) => {
              if (key !== value) {
                return null;
              }

              if (!group || !key) {
                return null;
              }

              return new ActionEvent({group, key});
            }),
            filterNonNullable(),
        );
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

export type RadioBindingLike = Pick<
    Bindings<ReversedSpec<(typeof $radioInput)['host']> >,
    'clearFn'|'initValue'|'value'
>;

export function bindRadioInputToState(
    resolver: MutableResolver<string|null>,
    bindings: readonly RadioBindingLike[],
): Observable<unknown> {
  return concat(
      bindOutput(resolver, bindings),
      bindInput(resolver, bindings),
  );
}

function bindInput(
    resolver: MutableResolver<string|null>,
    bindings: readonly RadioBindingLike[],
): Observable<unknown> {
  const obs$List = bindings.map(binding => binding.value.pipe(
      filterNonNullable(),
      resolver.set(),
  ));
  return merge(...obs$List);
}

function bindOutput(
    resolver: MutableResolver<string|null>,
    bindings: readonly RadioBindingLike[],
): Observable<unknown> {
  const obs$List = bindings.map(binding => resolver.pipe(
      take(1),
      binding.initValue(),
      binding.clearFn(),
  ));
  return merge(...obs$List);
}
