import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {arrayOfType, nullableType, stringType} from 'gs-types';
import {Context, ievent, itarget, ivalue, LABEL, oflag, otext, query, registerCustomElement, renderTemplate, TEMPLATE} from 'persona';
import {BehaviorSubject, combineLatest, Observable, OperatorFunction} from 'rxjs';
import {distinctUntilChanged, map, skip, tap, withLatestFrom} from 'rxjs/operators';


import {$baseRootOutputs} from '../action/base-action';
import {$overlayService, Anchor} from '../core/overlay-service';
import {ActionEvent} from '../event/action-event';
import {LINE_LAYOUT} from '../layout/line-layout';
import {renderTheme} from '../theme/render-theme';

import {BaseInput, create$baseInput} from './base-input';
import template from './select-input.html';
import {OPTION_TYPE, SELECT_OPTIONS} from './select-options';

const $selectInput = {
  host: {
    ...create$baseInput<string|null, string|null>(nullableType(stringType), null).host,
    options: ivalue('options', arrayOfType(OPTION_TYPE)),
  },
  shadow: {
    root: query('#root', LABEL, {
      ...$baseRootOutputs,
      disabled: oflag('disabled'),
      onClick: ievent('click', Event),
      target: itarget(),
    }),
    template: query('#template', TEMPLATE, {
      target: itarget(),
    }),
    value: query('#value', LINE_LAYOUT, {
      text: otext(),
    }),
  },
};

class SelectInput extends BaseInput<string|null, string|null> {
  private readonly selected$ = new BehaviorSubject<string|null>(null);

  constructor(private readonly $: Context<typeof $selectInput>) {
    super($, $.shadow.root.disabled, $.shadow.root);
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      renderTheme(this.$),
      this.handleClick(),
      this.renderValue(),
    ];
  }

  protected get domValue$(): Observable<string|null> {
    return this.selected$;
  }

  private handleClick(): Observable<unknown> {
    return this.$.shadow.root.onClick.pipe(
        withLatestFrom(this.$.shadow.root.target),
        tap(([, target]) => {
          $overlayService.get(this.$.vine).show({
            contentRenderSpec: renderTemplate({
              template$: this.$.shadow.template.target,
              spec: {
                options: query('mk-select-options', SELECT_OPTIONS),
              },
              runs: $ => [
                $.options.selected.pipe(
                    // Ignore the initial emission.
                    skip(1),
                    map(selected => selected ?? null),
                    forwardTo(this.selected$),
                ),
                this.selected$.pipe(
                    distinctUntilChanged(),
                    map(selected => [selected]),
                    $.options.setSelectedFn(),
                ),
                this.$.host.options.pipe(
                    map(options => ({options: options ?? []})),
                    $.options.specs(),
                ),
              ],
            }),
            contentAnchor: {
              horizontal: Anchor.START,
              vertical: Anchor.START,
            },
            target,
            targetAnchor: {
              horizontal: Anchor.START,
              vertical: Anchor.MIDDLE,
            },
          });
        }),
    );
  }

  @cache()
  private get optionsMap$(): Observable<ReadonlyMap<string, string>> {
    return this.$.host.options.pipe(
        map(options => {
          if (!options) {
            return new Map();
          }
          return new Map(options.map(({key, text}) => [key, text]));
        }),
    );
  }

  private renderValue(): Observable<unknown> {
    return combineLatest([
      this.selected$,
      this.optionsMap$,
    ])
        .pipe(
            map(([selected, optionsMap]) => {
              if (selected === null) {
                return '';
              }

              return optionsMap.get(selected) ?? '';
            }),
            this.$.shadow.value.text(),
        );
  }

  protected updateDomValue(): OperatorFunction<string|null, unknown> {
    return forwardTo(this.selected$);
  }

  get onAction$(): Observable<ActionEvent<string|null>> {
    return this.selected$.pipe(map(selected => new ActionEvent(selected)));
  }
}

export const SELECT_INPUT = registerCustomElement({
  tag: 'mk-select-input',
  ctrl: SelectInput,
  deps: [
    LINE_LAYOUT,
    SELECT_OPTIONS,
  ],
  template,
  spec: $selectInput,
});
