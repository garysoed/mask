/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredIcons.
 * @slot The glyph of the icon to display.
 */

import { VineImpl } from 'grapevine/export/main';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { BooleanType, InstanceofType, StringType } from 'gs-types/export';
import { AriaRole } from 'persona/export/a11y';
import { attributeOut, classlist, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { combineLatest, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import * as dialogCloseSvg from '../asset/dialog_close.svg';
import * as dialogConfirmSvg from '../asset/dialog_confirm.svg';
import { IconConfig } from '../configs/icon-config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
import iconTemplate from './icon.html';
import { SvgConfig } from './svg-config';
import { $svgConfig, $svgService } from './svg-service';

export const $ = resolveLocators({
  host: {
    ariaHidden: attributeOut(shadowHost, 'aria-hidden', booleanParser(), BooleanType),
    el: shadowHost,
    role: attributeOut(shadowHost, 'role', stringParser(), StringType),
    text: textContent(shadowHost),
  },
  root: {
    classList: classlist(element('root.el')),
    el: element('#root', InstanceofType(HTMLSpanElement)),
  },
});

@_p.customElement({
  tag: 'mk-icon',
  template: iconTemplate,
  watch: [
    $.host.el,
    $.root.el,
  ],
})
export class Icon extends ThemedCustomElementCtrl {
  @_p.render($.host.ariaHidden) ariaHidden_: boolean = true;
  @_p.render($.host.role) role_: AriaRole = AriaRole.PRESENTATION;

  init(vine: VineImpl): void {
    super.init(vine);

    this.addSubscription(
        combineLatest(
            vine.getObservable($.host.el.getReadingId(), this),
            vine.getObservable($svgService),
        )
        .pipe(
            switchMap(([hostEl, svgService]) => {
              const svgName = hostEl.textContent || '';

              return svgService.getSvg(svgName) || observableOf(null);
            }),
            switchMap(svg => {
              return combineLatest(
                  vine.getObservable($.root.el.getReadingId(), this),
                  observableOf(svg),
              );
            }),
        )
        .subscribe(([rootEl, svg]) => {
          rootEl.innerHTML = svg || '';
        }),
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
