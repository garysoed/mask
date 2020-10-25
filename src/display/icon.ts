/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */

import { cache } from 'gs-tools/export/data';
import { filterDefined } from 'gs-tools/export/rxjs';
import { typeBased } from 'gs-tools/export/serializer';
import { booleanType, instanceofType } from 'gs-types';
import { compose, json } from 'nabu';
import { AriaRole, attributeIn, attributeOut, element, enumParser, host, NodeWithId, PersonaContext, renderHtml, single, stringParser } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';

import { _p } from '../app/app';
import { $svgService } from '../core/svg-service';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

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
export class Icon extends ThemedCustomElementCtrl {
  private readonly icon$ = this.declareInput($.host._.icon);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.host._.ariaHidden, observableOf(true));
    this.render($.host._.role, observableOf(AriaRole.PRESENTATION));
    this.render($.root._.content, this.rootSvg$);
  }

  @cache()
  private get rootSvg$(): Observable<NodeWithId<Node>|null> {
    const node$ = combineLatest([$svgService.get(this.vine), this.icon$.pipe(filterDefined())])
        .pipe(
            switchMap(([svgService, svgName]) => svgService.getSvg(svgName)),
            switchMap(svg => {
              if (!svg) {
                return observableOf(null);
              }
              return renderHtml(svg, 'image/svg+xml', svg, this.context);
            }),
        );

    return combineLatest([node$, this.declareInput($.host._.fitTo)]).pipe(
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
