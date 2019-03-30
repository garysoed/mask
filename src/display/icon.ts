/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */

import { typeBased } from '@gs-tools/serializer';
import { BooleanType, InstanceofType } from '@gs-types';
import { json } from '@nabu/grammar';
import { Serializable } from '@nabu/main';
import { compose } from '@nabu/util';
import { AriaRole } from '@persona/a11y';
import { attributeIn, element } from '@persona/input';
import { attributeOut, innerHtml } from '@persona/output';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import iconTemplate from './icon.html';
import { $svgService, SvgService } from './svg-service';

export const $$ = {icon: attributeIn('icon', stringParser())};

export const $ = {
  host: element({
    ...$$,
    ariaHidden: attributeOut(
        'aria-hidden',
        compose<boolean, Serializable, string>(typeBased(BooleanType), json()),
        false,
    ),
    role: attributeOut('role', stringParser()),
  }),
  root: element('root', InstanceofType(HTMLSpanElement), {
    innerHTML: innerHtml(),
  }),
};

@_p.customElement({
  tag: 'mk-icon',
  template: iconTemplate,
})
export class Icon extends ThemedCustomElementCtrl {
  @_p.render($.host._.ariaHidden) ariaHidden_: boolean = true;
  @_p.render($.host._.role) role_: AriaRole = AriaRole.PRESENTATION;

  @_p.render($.root._.innerHTML)
  renderRootInnerHtml_(
      @_v.vineIn($svgService) svgServiceObs: Observable<SvgService>,
      @_p.input($.host._.icon) svgNameObs: Observable<string>,
  ): Observable<string> {
    return combineLatest(svgServiceObs, svgNameObs)
        .pipe(
            switchMap(([svgService, svgName]) => svgService.getSvg(svgName)),
            map(svg => svg || ''),
        );
  }
}
