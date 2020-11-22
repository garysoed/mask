/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */
// TODO: eslint to sort members.
import {cache} from 'gs-tools/export/data';
import {typeBased} from 'gs-tools/export/serializer';
import {booleanType, instanceofType} from 'gs-types';
import {compose, json} from 'nabu';
import {AriaRole, attributeIn, attributeOut, element, enumParser, host, NodeWithId, PersonaContext, renderHtml, single, stringParser, ValuesOf} from 'persona';
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

  get values(): ValuesOf<typeof $> {
    return {
      host: {
        ariaHidden: observableOf(true),
        role: observableOf(AriaRole.PRESENTATION),
      },
      root: {
        content: this.rootSvg$,
      },
    };
  }

  @cache()
  private get rootSvg$(): Observable<NodeWithId<Node>|null> {
    const node$ = combineLatest([$svgService.get(this.vine), this.inputs.host.icon])
        .pipe(
            switchMap(([svgService, svgName]) => svgService.getSvg(svgName)),
            switchMap(svg => {
              if (!svg) {
                return observableOf(null);
              }
              return renderHtml(svg, 'image/svg+xml', svg, this.context);
            }),
        );

    return combineLatest([node$, this.inputs.host.fitTo]).pipe(
        tap(([node, fitTo]) => {
          if (!(node instanceof Element)) {
            return;
          }

          if (fitTo === FitTo.HEIGHT) {
            node.removeAttribute('width');
            node.setAttribute('height', 'auto');
          } else {
            node.removeAttribute('height');
            node.setAttribute('width', 'auto');
          }
        }),
        map(([node]) => node),
        share(),
    );
  }
}
