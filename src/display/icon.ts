/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */
import {filterByType} from 'gs-tools/export/rxjs';
import {enumType} from 'gs-types';
import {Context, Ctrl, iattr, oattr, ocase, ParseType, query, registerCustomElement, RenderSpec, renderString, SPAN, SVG} from 'persona';
import {Observable, of, OperatorFunction} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$svgService} from '../core/svg-service';
import {renderTheme} from '../theme/render-theme';

import template from './icon.html';


export enum FitTo {
  HEIGHT = 'height',
  WIDTH = 'width',
}


const $icon = {
  host: {
    icon: iattr('icon'),
    fitTo: iattr('fit-to'),
  },
  shadow: {
    root: query('#root', SPAN, {
      content: ocase(),
    }),
  },
};

class Icon implements Ctrl {
  constructor(private readonly $: Context<typeof $icon>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.$.host.icon.pipe(
          switchMap(svgName => {
            if (!svgName) {
              return of(null);
            }
            return $svgService.get(this.$.vine).getSvg(svgName);
          }),
          this.$.shadow.root.content(this.renderSvg())),
    ];
  }

  private renderSvg(): OperatorFunction<string|null, RenderSpec|null> {
    return map(svgContent => {
      if (!svgContent) {
        return null;
      }

      return renderString({
        raw: of(svgContent),
        parseType: ParseType.SVG,
        spec: {
          root: query(null, SVG, {
            height: oattr('height'),
            width: oattr('width'),
          }),
        },
        runs: $ => {
          const fitTo$ = this.$.host.fitTo.pipe(
              filterByType(enumType<FitTo>(FitTo)),
          );
          const width$ = fitTo$.pipe(map(fitTo => fitTo === FitTo.HEIGHT ? null : '100%'));
          const height$ = fitTo$.pipe(map(fitTo => fitTo === FitTo.HEIGHT ? '100%' : null));
          return [
            width$.pipe($.root.width()),
            height$.pipe($.root.height()),
          ];
        },
      });
    });
  }
}

export const ICON = registerCustomElement({
  ctrl: Icon,
  spec: $icon,
  tag: 'mk-icon',
  template,
});
