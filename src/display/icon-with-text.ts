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

import { createImmutableSet, ImmutableSet } from 'gs-tools/export/collect';
import { ElementWithTagType, InstanceofType, StringType } from 'gs-types/export';
import { attributeIn, element } from 'persona/export/input';
import { attributeOut, classlist, textContent } from 'persona/export/output';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { IconConfig } from '../configs/icon-config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import iconWithTextTemplate from './icon-with-text.html';

export const $ = {
  host: element({
    icon: attributeIn('icon', stringParser(), StringType, ''),
    label: attributeIn('label', stringParser(), StringType, ''),
    mode: attributeIn('mode', stringParser(), StringType, ''),
  }),
  icon: element('icon', ElementWithTagType('mk-icon'), {
    classes: classlist(),
    icon: attributeOut('icon', stringParser()),
    mode: attributeOut('mode', stringParser()),
  }),
  text: element('text', InstanceofType(HTMLDivElement), {
    classes: classlist(),
    text: textContent(),
  }),
};

@_p.customElement({
  input: [
    $.host._.icon,
    $.host._.label,
    $.host._.mode,
  ],
  tag: 'mk-icon-with-text',
  template: iconWithTextTemplate,
})
@_p.render($.text._.text).withForwarding($.host._.label.id)
@_p.render($.icon._.icon).withForwarding($.host._.icon.id)
@_p.render($.icon._.mode).withForwarding($.host._.mode.id)
export class IconWithText extends ThemedCustomElementCtrl {
  @_p.render($.icon._.classes)
  renderIconClasses_(
      @_v.vineIn($.host._.icon.id) iconLigatureObs: Observable<string>,
  ): Observable<ImmutableSet<string>> {
    return iconLigatureObs.pipe(
        map(iconLigature => {
          if (!iconLigature) {
            return createImmutableSet();
          }

          return createImmutableSet(['hasIcon']);
        }),
    );
  }

  @_p.render($.text._.classes)
  renderTextClasses_(
      @_v.vineIn($.host._.label.id) labelObs: Observable<string>,
  ): Observable<ImmutableSet<string>> {
    return labelObs.pipe(
        map(label => {
          if (!label) {
            return createImmutableSet();
          }

          return createImmutableSet(['hasText']);
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
