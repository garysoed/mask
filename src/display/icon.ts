/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */

import { VineImpl } from 'grapevine/export/main';
import { $pipe, $push, asImmutableMap } from 'gs-tools/export/collect';
import { typeBased } from 'gs-tools/export/serializer';
import { BooleanType, InstanceofType } from 'gs-types/export';
import { json } from 'nabu/export/grammar';
import { Serializable } from 'nabu/export/main';
import { compose } from 'nabu/export/util';
import { AriaRole } from 'persona/export/a11y';
import { attributeIn, element } from 'persona/export/input';
import { attributeOut, innerHtml } from 'persona/export/output';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import * as dialogCloseSvg from '../asset/dialog_close.svg';
import * as dialogConfirmSvg from '../asset/dialog_confirm.svg';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import iconTemplate from './icon.html';
import { SvgConfig } from './svg-config';
import { $svgConfig, $svgService, SvgService } from './svg-service';

export const $ = {
  host: element({
    ariaHidden: attributeOut(
        'aria-hidden',
        compose<boolean, Serializable, string>(typeBased(BooleanType), json()),
        false,
    ),
    icon: attributeIn('icon', stringParser()),
    role: attributeOut('role', stringParser()),
  }),
  root: element('root', InstanceofType(HTMLSpanElement), {
    innerHTML: innerHtml(),
  }),
};

@_p.customElement({
  configure(vine: VineImpl): void {
    vine.getObservable($svgConfig)
        .pipe(take(1))
        .subscribe(svgConfig => {
          const newConfig = $pipe(
              svgConfig,
              $push<[string, SvgConfig], string>(
                  ['dialog_close', {type: 'embed', content: dialogCloseSvg}],
                  ['dialog_confirm', {type: 'embed', content: dialogConfirmSvg}],
              ),
              asImmutableMap(),
          );

          vine.setValue($svgConfig, newConfig);
        });
  },
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
            switchMap(([svgService, svgName]) => {
              return svgService.getSvg(svgName) || observableOf(null);
            }),
            map(svg => svg || ''),
        );
  }
}
