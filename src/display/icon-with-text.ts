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
import { attribute, classlist, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { _p } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import { IconConfig } from './icon-config';
import iconWithTextTemplate from './icon-with-text.html';

export const $ = resolveLocators({
  host: {
    el: shadowHost,
    icon: attribute(shadowHost, 'icon', stringParser(), StringType, ''),
    iconFamily: attribute(shadowHost, 'icon-family', stringParser(), StringType, ''),
    label: attribute(shadowHost, 'label', stringParser(), StringType),
  },
  icon: {
    classes: classlist(element('icon.el')),
    el: element('#icon', ElementWithTagType('mk-icon')),
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
export class IconWithText extends ThemedCustomElementCtrl {
  @_p.render($.icon.classes)
  renderIconClasses_(
      @_p.input($.host.icon) iconLigature: string,
  ): ImmutableSet<string> {
    if (!iconLigature) {
      return ImmutableSet.of();
    }

    return ImmutableSet.of(['hasIcon']);
  }

  @_p.render($.text.classes)
  renderTextClasses_(
      @_p.input($.host.label) label: string,
  ): ImmutableSet<string> {
    if (!label) {
      return ImmutableSet.of();
    }

    return ImmutableSet.of(['hasText']);
  }
}

export function iconWithText(iconConfig: IconConfig): Config {
  return {
    dependencies: [iconConfig],
    tag: 'mk-icon-with-text',
  };
}
