import {source} from 'grapevine';
import {forwardTo} from 'gs-tools/export/rxjs';
import {Context, Ctrl, DIV, ievent, itarget, oattr, oforeach, otext, query, registerCustomElement, renderTemplate, TEMPLATE} from 'persona';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {LINE_LAYOUT} from '../layout/line-layout';
import {renderTheme} from '../theme/render-theme';

import template from './select-options.html';

interface Option {
  readonly text: string;
  readonly key: string;
}

interface OptionSpecs {
  readonly options: readonly Option[];
}

export const $selectOptionsSpecs$ = source(() => new BehaviorSubject<OptionSpecs|null>(null));
export const $selectOptionsSelected$ = source(() => new BehaviorSubject<string|null>(null));

const selectOptions$ = {
  shadow: {
    container: query('#container', DIV, {
      contents: oforeach<Option>(),
    }),
    optionTemplate: query('#optionTemplate', TEMPLATE, {
      target: itarget(),
    }),
  },
};

class SelectOptions implements Ctrl {
  constructor(private readonly $: Context<typeof selectOptions$>) {}

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.renderOptions(),
    ];
  }

  private renderOptions(): Observable<unknown> {
    const selected$ = $selectOptionsSelected$.get(this.$.vine);
    return $selectOptionsSpecs$.get(this.$.vine).pipe(
        map(value => value?.options ?? []),
        this.$.shadow.container.contents(map(({text, key}) => renderTemplate({
          template$: this.$.shadow.optionTemplate.target,
          spec: {
            layout: query('mk-line-layout', LINE_LAYOUT, {
              onClick: ievent('click', Event),
              text: otext(),
              themeContext: oattr('mk-theme-context'),
            }),
          },
          runs: $ => [
            of(text).pipe($.layout.text()),
            selected$.pipe(
                map(selected => selected === key ? 'highlight' : ''),
                $.layout.themeContext(),
            ),
            $.layout.onClick.pipe(
                map(() => key),
                forwardTo(selected$),
            ),
          ],
        }))),
    );
  }
}

export const SELECT_OPTIONS = registerCustomElement({
  tag: 'mk-select-options',
  ctrl: SelectOptions,
  deps: [LINE_LAYOUT],
  spec: selectOptions$,
  template,
});
