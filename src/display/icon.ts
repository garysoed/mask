/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */

import { compose, json, Serializable } from 'nabu';

import { Vine } from 'grapevine';
import { stringMatchConverter, typeBased } from 'gs-tools/export/serializer';
import { enums } from 'gs-tools/export/typescript';
import { BooleanType, InstanceofType } from 'gs-types';
import { AriaRole, attributeIn, attributeOut, element, InitFn, innerHtml } from 'persona';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { _p, _v } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';

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
  tag: $$.tag,
  template: iconTemplate,
})
export class Icon extends ThemedCustomElementCtrl {
  private readonly icon$ = this.declareInput($.host._.icon);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.host._.ariaHidden).withValue(true),
      _p.render($.host._.role).withValue(AriaRole.PRESENTATION),
      this.renderStream($.root._.innerHTML, this.renderRootInnerHtml_),
    ];
  }

  renderRootInnerHtml_(
      vine: Vine,
  ): Observable<string> {
    return combineLatest([$svgService.get(vine), this.icon$])
        .pipe(
            switchMap(([svgService, svgName]) => svgService.getSvg(svgName)),
            map(svg => svg || ''),
        );
  }
}
