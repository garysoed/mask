/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */

import { VineImpl } from 'grapevine/export/main';
import { typeBased } from 'gs-tools/export/serializer';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { BooleanType, InstanceofType, StringType } from 'gs-types/export';
import { json } from 'nabu/export/grammar';
import { Serializable } from 'nabu/export/main';
import { compose } from 'nabu/export/util';
import { AriaRole } from 'persona/export/a11y';
import { attributeIn, element } from 'persona/export/input';
import { attributeOut, innerHtml } from 'persona/export/output';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import * as dialogCloseSvg from '../asset/dialog_close.svg';
import * as dialogConfirmSvg from '../asset/dialog_confirm.svg';
import { IconConfig } from '../configs/icon-config';
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
        value => !value),
    icon: attributeIn('icon', stringParser(), StringType),
    role: attributeOut('role', stringParser()),
  }),
  root: element('root', InstanceofType(HTMLSpanElement), {
    innerHTML: innerHtml(),
  }),
};

@_p.customElement({
  input: [$.host, $.host._.icon],
  tag: 'mk-icon',
  template: iconTemplate,
})
export class Icon extends ThemedCustomElementCtrl {
  @_p.render($.host._.ariaHidden) ariaHidden_: boolean = true;
  @_p.render($.host._.role) role_: AriaRole = AriaRole.PRESENTATION;

  @_p.render($.root._.innerHTML)
  renderRootInnerHtml_(
      @_v.vineIn($svgService) svgServiceObs: Observable<SvgService>,
      @_v.vineIn($.host._.icon.id) svgNameObs: Observable<string>,
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

export function icon(
    svgConfig: ImmutableMap<string, SvgConfig>,
): IconConfig {
  return {
    configure(vine: VineImpl): void {
      vine.setValue(
          $svgConfig,
          svgConfig
              .add(['dialog_close', {type: 'embed', content: dialogCloseSvg}])
              .add(['dialog_confirm', {type: 'embed', content: dialogConfirmSvg}]),
      );
    },
    tag: 'mk-icon',
  };
}
