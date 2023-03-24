import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {Context, ievent, INPUT, itarget, LABEL, query, registerCustomElement} from 'persona';
import {oflag} from 'persona/src/output/flag';
import {merge, Observable, OperatorFunction, pipe, Subject} from 'rxjs';
import {map, startWith, tap, withLatestFrom} from 'rxjs/operators';

import {$baseRootOutputs} from '../action/base-action';
import checkboxChecked from '../asset/checkbox_checked.svg';
import checkboxEmpty from '../asset/checkbox_empty.svg';
import checkboxUnknown from '../asset/checkbox_unknown.svg';
import {registerSvg} from '../core/svg-service';
import {ICON} from '../display/icon';
import {LIST_ITEM_LAYOUT} from '../layout/list-item-layout';
import {renderTheme} from '../theme/render-theme';

import {BaseInput, create$baseInput} from './base-input';
import template from './checkbox.html';


export type CheckedValue = boolean | null;

const $checkbox = {
  host: {
    ...create$baseInput<CheckedValue>(false).host,
  },
  shadow: {
    container: query('#container', LABEL, {
      ...$baseRootOutputs,
      disabled: oflag('mk-disabled'),
    }),
    icon: query('#icon', ICON),
    input: query('#input', INPUT, {
      element: itarget(),
      onChange: ievent('change', Event),
    }),
  },
};

class Checkbox extends BaseInput<CheckedValue> {
  private readonly onDomValueUpdated$ = new Subject<void>();

  constructor(private readonly $: Context<typeof $checkbox>) {
    super(
        $,
        $.shadow.input.disabled,
        $.shadow.container,
    );
  }

  @cache()
  override get runs(): ReadonlyArray<Observable<unknown>> {
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
