import {forwardTo} from 'gs-tools/export/rxjs';
import {arrayOfType, hasPropertiesType, nullableType, stringType} from 'gs-types';
import {Context, Ctrl, DIV, icall, ievent, itarget, ivalue, oattr, oforeach, otext, ovalue, query, registerCustomElement, renderTemplate, TEMPLATE} from 'persona';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {$overlayService} from '../core/overlay-service';
import {LINE_LAYOUT} from '../layout/line-layout';
import {renderTheme} from '../theme/render-theme';

import template from './select-options.html';

export interface Option {
  readonly text: string;
  readonly key: string;
}
export const OPTION_TYPE = hasPropertiesType<Option>({
  text: stringType,
  key: stringType,
});

export interface OptionSpecs {
  readonly options: readonly Option[];
}
export const OPTION_SPECS_TYPE = hasPropertiesType<OptionSpecs>({
  options: arrayOfType(OPTION_TYPE),
});

const selectOptions$ = {
  host: {
    specs: ivalue('specs', OPTION_SPECS_TYPE),
    selected: ovalue('selected', nullableType(stringType)),
    setSelectedFn: icall('setSelected', [nullableType(stringType)]),
  },
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
  private readonly selected$ = new BehaviorSubject<string|null>(null);

  constructor(private readonly $: Context<typeof selectOptions$>) {}

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.handleSetSelected(),
      this.renderOptions(),
      this.selected$.pipe(this.$.host.selected()),
    ];
  }

  private handleSetSelected(): Observable<unknown> {
    return this.$.host.setSelectedFn.pipe(
        map(([selected]) => selected),
        forwardTo(this.selected$),
    );
  }

  private renderOptions(): Observable<unknown> {
    return this.$.host.specs.pipe(
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
            this.selected$.pipe(
                map(selected => selected === key ? 'highlight' : ''),
                $.layout.themeContext(),
            ),
            $.layout.onClick.pipe(
                map(() => key),
                forwardTo(this.selected$),
                tap(() => {
                  $overlayService.get(this.$.vine).show(null);
                }),
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
