/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */
import {enumType} from 'gs-types';
import {Context, Ctrl, iattr, ocase, query, registerCustomElement, renderHtml, RenderSpec, SPAN} from 'persona';
import {Observable, of, pipe} from 'rxjs';
import {switchMap, tap, withLatestFrom} from 'rxjs/operators';

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
          this.$.shadow.root.content(svgContent => this.renderSvg(svgContent))),
    ];
  }

  private renderSvg(svgContent: string|null): RenderSpec|null {
    if (!svgContent) {
      return null;
    }

    return renderHtml({
      decorator: pipe(
          withLatestFrom(this.$.host.fitTo),
          tap(([element, fitTo]) => {
            if (!enumType<FitTo>(FitTo).check(fitTo)) {
              return;
            }

            if (fitTo === FitTo.HEIGHT) {
              element.removeAttribute('width');
              element.setAttribute('height', '100%');
            } else {
              element.setAttribute('width', '100%');
              element.removeAttribute('height');
            }
          }),
      ),
      raw: of(svgContent),
      parseType: 'image/svg+xml' as const,
    });
  }
}

export const ICON = registerCustomElement({
  ctrl: Icon,
  spec: $icon,
  tag: 'mk-icon',
  template,
});
