import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {booleanType, nullType, Type, unionType} from 'gs-types';
import {Context, id, ievent, INPUT, itarget, LABEL, registerCustomElement} from 'persona';
import {oflag} from 'persona/src/output/flag';
import {merge, Observable, OperatorFunction, pipe, Subject} from 'rxjs';
import {distinctUntilChanged, map, skip, startWith, tap, withLatestFrom} from 'rxjs/operators';

import {$baseRootOutputs} from '../action/base-action';
import checkboxChecked from '../asset/checkbox_checked.svg';
import checkboxEmpty from '../asset/checkbox_empty.svg';
import checkboxUnknown from '../asset/checkbox_unknown.svg';
import {registerSvg} from '../core/svg-service';
import {ICON} from '../display/icon';
import {ActionEvent} from '../event/action-event';
import {BaseInput, create$baseInput} from '../input/base-input';
import {LIST_ITEM_LAYOUT} from '../layout/list-item-layout';
import {renderTheme} from '../theme/render-theme';

import template from './checkbox.html';


export type CheckedValue = boolean | null;
const CHECKED_VALUE_TYPE: Type<CheckedValue> = unionType([
  booleanType,
  nullType,
]);

const $checkbox = {
  host: {
    ...create$baseInput(CHECKED_VALUE_TYPE, false).host,
  },
  shadow: {
    container: id('container', LABEL, {
      ...$baseRootOutputs,
      disabled: oflag('mk-disabled'),
    }),
    icon: id('icon', ICON),
    input: id('input', INPUT, {
      element: itarget(),
      onChange: ievent('change'),
    }),
  },
};

export class Checkbox extends BaseInput<CheckedValue, CheckedValue> {
  private readonly onDomValueUpdated$ = new Subject<void>();

  constructor(private readonly $: Context<typeof $checkbox>) {
    super(
        $,
        $.shadow.input.disabled,
        $.shadow.container,
    );
  }

  @cache()
  get onAction$(): Observable<ActionEvent<CheckedValue>> {
    return this.domValue$.pipe(distinctUntilChanged(), skip(1), map(value => new ActionEvent(value)));
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      renderTheme(this.$),
      this.checkMode$.pipe(this.$.shadow.icon.icon()),
    ];
  }

  @cache()
  private get checkMode$(): Observable<string> {
    return this.domValue$.pipe(
        map(checkState => {
          switch (checkState) {
            case null:
              return 'unknown';
            case true:
              return 'checked';
            case false:
              return 'unchecked';
          }
        }),
        map(base => `mk.checkbox_${base}`),
    );
  }

  @cache()
  protected get domValue$(): Observable<CheckedValue> {
    return merge(
        this.$.shadow.input.onChange,
        this.onDomValueUpdated$,
    )
        .pipe(
            startWith({}),
            withLatestFrom(this.$.shadow.input.element),
            map(([, element]) => {
              if (!(element instanceof HTMLInputElement)) {
                throw new Error('Element is not an HTMLInputElement');
              }

              if (element.indeterminate) {
                return null;
              }

              return element.checked;
            }),
        );
  }

  protected updateDomValue(): OperatorFunction<CheckedValue, unknown> {
    return pipe(
        withLatestFrom(this.$.shadow.input.element),
        tap(([newValue, element]) => {
          if (!(element instanceof HTMLInputElement)) {
            throw new Error('Element is not an HTMLInputElement');
          }

          if (newValue === null) {
            element.indeterminate = true;
            element.checked = false;
          } else {
            element.indeterminate = false;
            element.checked = newValue;
          }

          this.onDomValueUpdated$.next();
        }),
    );
  }
}

export const CHECKBOX = registerCustomElement({
  ctrl: Checkbox,
  configure(vine: Vine): void {
    registerSvg(
        vine,
        'mk.checkbox_checked',
        {type: 'embed', content: checkboxChecked},
    );
    registerSvg(
        vine,
        'mk.checkbox_unchecked',
        {type: 'embed', content: checkboxEmpty},
    );
    registerSvg(
        vine,
        'mk.checkbox_unknown',
        {type: 'embed', content: checkboxUnknown},
    );
  },
  deps: [
    ICON,
    LIST_ITEM_LAYOUT,
  ],
  spec: $checkbox,
  tag: 'mk-checkbox',
  template,
});
