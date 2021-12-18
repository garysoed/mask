import {cache} from 'gs-tools/export/data';
import {filterByType} from 'gs-tools/export/rxjs';
import {enumType, stringType} from 'gs-types';
import {AutocompleteType, Context, iattr, id, ievent, INPUT, InputType, itarget, LABEL, oattr, registerCustomElement} from 'persona';
import {oflag} from 'persona/src-next/output/flag';
import {merge, Observable, OperatorFunction, pipe, Subject} from 'rxjs';
import {map, startWith, tap, withLatestFrom} from 'rxjs/operators';

import {$baseRootOutputs} from '../action/base-action';
import {LINE_LAYOUT} from '../layout/line-layout';
import {renderTheme} from '../theme/render-theme';

import {BaseInput, create$baseInput} from './base-input';
import template from './text-input.html';


const $textInput = {
  host: {
    ...create$baseInput(stringType, '').host,
    autocomplete: iattr('autocomplete'),
    type: iattr('type'),
  },
  shadow: {
    input: id('input', INPUT, {
      autocomplete: oattr('autocomplete'),
      disabled: oflag('disabled'),
      element: itarget(),
      onChange: ievent('change'),
    }),
    root: id('root', LABEL, {
      ...$baseRootOutputs,
    }),
  },
};

export class TextInput extends BaseInput<string> {
  private readonly onDomValueUpdated$ = new Subject<void>();

  constructor(private readonly $: Context<typeof $textInput>) {
    super(
        $,
        $.shadow.input.disabled,
        $.shadow.root,
    );
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      renderTheme(this.$),
      this.$.host.type.pipe(
          filterByType(enumType<InputType>(InputType)),
          this.$.shadow.input.type(),
      ),
      this.$.host.autocomplete.pipe(
          filterByType(enumType<AutocompleteType>(AutocompleteType)),
          this.$.shadow.input.autocomplete(),
      ),
    ];
  }

  @cache()
  protected get domValue$(): Observable<string> {
    return merge(
        this.$.shadow.input.onChange,
        this.onDomValueUpdated$,
    )
        .pipe(
            startWith({}),
            withLatestFrom(this.$.shadow.input.element),
            map(([, el]) => {
              if (!(el instanceof HTMLInputElement)) {
                throw new Error('Element is not an HTMLInputElement');
              }
              return el.value;
            }),
        );
  }

  protected updateDomValue(): OperatorFunction<string, unknown> {
    return pipe(
        withLatestFrom(this.$.shadow.input.element),
        tap(([newValue, element]) => {
          if (!(element instanceof HTMLInputElement)) {
            throw new Error('Element is not an HTMLInputElement');
          }
          element.value = newValue;
          this.onDomValueUpdated$.next();
        }),
    );
  }
}

export const TEXT_INPUT = registerCustomElement({
  ctrl: TextInput,
  deps: [LINE_LAYOUT],
  spec: $textInput,
  tag: 'mk-text-input',
  template,
});