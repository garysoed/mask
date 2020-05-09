/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */

import { filterDefined } from 'gs-tools/export/rxjs';
import { stringMatchConverter, typeBased } from 'gs-tools/export/serializer';
import { enums } from 'gs-tools/export/typescript';
import { booleanType, instanceofType } from 'gs-types';
import { compose, json, Serializable } from 'nabu';
import { AriaRole, attributeIn, attributeOut, element, InnerHtmlRenderSpec, NoopRenderSpec, PersonaContext, RenderSpec, single, stringParser } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import { IconMode } from './icon-mode';
import iconTemplate from './icon.html';
import { $svgService } from './svg-service';


export const $$ = {
  api: {
    icon: attributeIn('icon', stringParser()),
    mode: attributeIn('mode', stringMatchConverter(enums.getAllValues<IconMode>(IconMode))),
  },
  tag: 'mk-icon',
};

export const $ = {
  host: element({
    ...$$.api,
    ariaHidden: attributeOut(
        'aria-hidden',
        compose<boolean, Serializable, string>(typeBased(booleanType), json()),
        false,
    ),
    role: attributeOut('role', stringParser()),
  }),
  root: element('root', instanceofType(HTMLSpanElement), {
    content: single('#content'),
  }),
};

@_p.customElement({
  tag: $$.tag,
  template: iconTemplate,
})
export class Icon extends ThemedCustomElementCtrl {
  private readonly icon$ = this.declareInput($.host._.icon);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.host._.ariaHidden, observableOf(true));
    this.render($.host._.role, observableOf(AriaRole.PRESENTATION));
    this.render($.root._.content, this.renderRootInnerHtml());
  }

  private renderRootInnerHtml(): Observable<RenderSpec> {
    return combineLatest([$svgService.get(this.vine), this.icon$.pipe(filterDefined())])
        .pipe(
            switchMap(([svgService, svgName]) => svgService.getSvg(svgName)),
            map(svg => {
              if (!svg) {
                return new NoopRenderSpec();
              }
              return new InnerHtmlRenderSpec(
                  svg,
                  'image/svg+xml',
                  this.vine,
              );
            }),
        );
  }
}
