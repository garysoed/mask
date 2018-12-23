/**
 * @webcomponent mk-icon-with-text
 * Displays an icon using icon font and a text
 *
 * @attr {<string} icon Icon ligature.
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredFonts.
 * @attr {<string} label Text to display
 * @slot The glyph of the icon to display.
 */

import { ImmutableSet } from 'gs-tools/export/collect';
import { ElementWithTagType, InstanceofType, StringType } from 'gs-types/export';
import { attributeIn, attributeOut, classlist, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p } from '../app/app';
import { Config } from '../app/config';
import { IconConfig } from '../configs/icon-config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import iconWithTextTemplate from './icon-with-text.html';

export const $ = resolveLocators({
  host: {
    el: shadowHost,
    icon: attributeIn(shadowHost, 'icon', stringParser(), StringType, ''),
    label: attributeIn(shadowHost, 'label', stringParser(), StringType, ''),
    mode: attributeIn(shadowHost, 'mode', stringParser(), StringType, ''),
  },
  icon: {
    classes: classlist(element('icon.el')),
    el: element('#icon', ElementWithTagType('mk-icon')),
    mode: attributeOut(element('icon.el'), 'mode', stringParser(), StringType),
    text: textContent(element('icon.el')),
  },
  text: {
    classes: classlist(element('text.el')),
    el: element('#text', InstanceofType(HTMLDivElement)),
    text: textContent(element('text.el')),
  },
});

@_p.customElement({
  tag: 'mk-icon-with-text',
  template: iconWithTextTemplate,
})
@_p.render($.text.text).withForwarding($.host.label)
@_p.render($.icon.text).withForwarding($.host.icon)
@_p.render($.icon.mode).withForwarding($.host.mode)
export class IconWithText extends ThemedCustomElementCtrl {
  @_p.render($.icon.classes)
  renderIconClasses_(
      @_p.input($.host.icon) iconLigatureObs: Observable<string>,
  ): Observable<ImmutableSet<string>> {
    return iconLigatureObs.pipe(
        map(iconLigature => {
          if (!iconLigature) {
            return ImmutableSet.of();
          }

          return ImmutableSet.of(['hasIcon']);
        }),
    );
  }

  @_p.render($.text.classes)
  renderTextClasses_(
      @_p.input($.host.label) labelObs: Observable<string>,
  ): Observable<ImmutableSet<string>> {
    return labelObs.pipe(
        map(label => {
          if (!label) {
            return ImmutableSet.of();
          }

          return ImmutableSet.of(['hasText']);
        }),
    );
  }
}

export interface IconWithTextConfig extends Config {
  tag: 'mk-icon-with-text';
}

export function iconWithText(iconConfig: IconConfig): IconWithTextConfig {
  return {
    dependencies: [iconConfig],
    tag: 'mk-icon-with-text',
  };
}
