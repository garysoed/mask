import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {arrayOfType} from 'gs-types';
import {Context, ievent, irect, itarget, ivalue, LABEL, oflag, otext, query, registerCustomElement, renderTemplate, TEMPLATE} from 'persona';
import {BehaviorSubject, combineLatest, Observable, OperatorFunction} from 'rxjs';
import {distinctUntilChanged, map, skip, tap, withLatestFrom} from 'rxjs/operators';


import {$baseRootOutputs} from '../action/base-action';
import {$overlayService, Anchor} from '../core/overlay-service';
import {ActionEvent} from '../event/action-event';
import {LINE_LAYOUT} from '../layout/line-layout';
import {renderTheme} from '../theme/render-theme';

import {BaseInput, create$baseInput} from './base-input-2';
import template from './select-input.html';
import {OPTION_TYPE, SELECT_OPTIONS} from './select-options';

const $selectInput = {
  host: {
    ...create$baseInput<string|null>(null).host,
    options: ivalue('options', arrayOfType(OPTION_TYPE)),
  },
  shadow: {
    root: query('#root', LABEL, {
      ...$baseRootOutputs,
      disabled: oflag('disabled'),
      onClick: ievent('click', Event),
    }),
    template: query('#template', TEMPLATE, {
      target: itarget(),
    }),
    value: query('#value', LINE_LAYOUT, {
      rect: irect(),
      target: itarget(),
      text: otext(),
    }),
  },
};

class SelectInput extends BaseInput<string|null> {
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
    const overlayService = $overlayService.get(this.$.vine);
    return this.$.shadow.root.onClick.pipe(
        withLatestFrom(this.$.shadow.value.target),
        tap(([, target]) => {
          overlayService.show({
            contentRenderSpec: renderTemplate({
              template$: this.$.shadow.template.target,
              spec: {
                options: query('mk-select-options', SELECT_OPTIONS),
              },
              runs: $ => [
                this.$.shadow.value.rect.pipe(
                    map(rect => rect.width),
                    $.options.width(),
                ),
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
              vertical: Anchor.START,
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
