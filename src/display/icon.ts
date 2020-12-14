/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */
import {cache} from 'gs-tools/export/data';
import {typeBased} from 'gs-tools/export/serializer';
import {booleanType, instanceofType} from 'gs-types';
import {compose, json} from 'nabu';
import {AriaRole, attributeIn, attributeOut, element, enumParser, host, PersonaContext, renderHtml, RenderSpec, single, stringParser} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, share, switchMap, tap} from 'rxjs/operators';

import {_p} from '../app/app';
import {$svgService} from '../core/svg-service';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

import template from './icon.html';


export enum FitTo {
  HEIGHT = 'height',
  WIDTH = 'width',
}


export const $icon = {
  api: {
    icon: attributeIn('icon', stringParser(), ''),
    fitTo: attributeIn('fit-to', enumParser<FitTo>(FitTo), FitTo.HEIGHT),
  },
  tag: 'mk-icon',
};

export const $ = {
  host: host({
    ...$icon.api,
    ariaHidden: attributeOut(
        'aria-hidden',
        compose<boolean, unknown, string>(typeBased(booleanType), json()),
        false,
    ),
    role: attributeOut('role', stringParser()),
  }),
  root: element('root', instanceofType(HTMLSpanElement), {
    content: single('#content'),
  }),
};

@_p.customElement({
  ...$icon,
  template,
})
export class Icon extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.host.ariaHidden(observableOf(true)),
      this.renderers.host.role(observableOf(AriaRole.PRESENTATION)),
      this.renderers.root.content(this.rootSvg$),
    ];
  }

  @cache()
  private get rootSvg$(): Observable<RenderSpec|null> {
    return combineLatest([$svgService.get(this.vine), this.inputs.host.icon])
        .pipe(
            switchMap(([svgService, svgName]) => svgService.getSvg(svgName)),
            map(svg => {
              if (!svg) {
                return null;
              }

              return renderHtml({
                decorator: element => this.inputs.host.fitTo
                    .pipe(
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
                raw: svg,
                parseType: 'image/svg+xml' as const,
                id: svg,
              });
            }),
            share(),
        );
  }
}
