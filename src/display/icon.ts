/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */
import {cache} from 'gs-tools/export/data';
import {filterByType} from 'gs-tools/export/rxjs';
import {enumType} from 'gs-types';
import {Context, Ctrl, iattr, id, osingle, registerCustomElement, renderHtml, RenderSpec, SPAN} from 'persona';
import {Observable, of} from 'rxjs';
import {map, share, switchMap, tap} from 'rxjs/operators';

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
    root: id('root', SPAN, {
      content: osingle(),
    }),
  },
};

class Icon implements Ctrl {
  constructor(private readonly $: Context<typeof $icon>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.rootSvg$.pipe(this.$.shadow.root.content()),
    ];
  }

  @cache()
  private get rootSvg$(): Observable<RenderSpec|null> {
    return this.$.host.icon
        .pipe(
            switchMap(svgName => svgName ? $svgService.get(this.$.vine).getSvg(svgName) : of(null)),
            map(svg => {
              if (!svg) {
                return null;
              }

              return renderHtml({
                decorators: [
                  element => this.$.host.fitTo
                      .pipe(
                          filterByType(enumType<FitTo>(FitTo)),
                          tap(fitTo => {
                            if (fitTo === FitTo.HEIGHT) {
                              element.removeAttribute('width');
                              element.setAttribute('height', '100%');
                            } else {
                              element.setAttribute('width', '100%');
                              element.removeAttribute('height');
                            }
                          }),
                          map(([element]) => element),
                      ),
                ],
                raw: of(svg),
                parseType: 'image/svg+xml' as const,
                id: svg,
              });
            }),
            share(),
        );
  }
}

export const ICON = registerCustomElement({
  ctrl: Icon,
  spec: $icon,
  tag: 'mk-icon',
  template,
});
