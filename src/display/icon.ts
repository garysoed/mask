/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */

import { Vine } from '@grapevine';
import { typeBased } from '@gs-tools/serializer';
import { BooleanType, InstanceofType } from '@gs-types';
import { json } from '@nabu/grammar';
import { Serializable } from '@nabu/main';
import { compose } from '@nabu/util';
import { AriaRole, attributeIn, attributeOut, element, InitFn, innerHtml } from '@persona';
import { combineLatest, Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';
import { _p, _v } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import iconTemplate from './icon.html';
import { $svgService } from './svg-service';

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
  private readonly iconObs = _p.input($.host._.icon, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.host._.ariaHidden).withValue(true),
      _p.render($.host._.role).withValue(AriaRole.PRESENTATION),
      _p.render($.root._.innerHTML).withVine(_v.stream(this.renderRootInnerHtml_, this)),
    ];
  }

  renderRootInnerHtml_(
      vine: Vine,
  ): Observable<string> {
    return combineLatest($svgService.get(vine), this.iconObs)
        .pipe(
            switchMap(([svgService, svgName]) => svgService.getSvg(svgName)),
            map(svg => svg || ''),
        );
  }
}
