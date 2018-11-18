/**
 * @webcomponent mk-icon
 * Displays an icon using icon font.
 *
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredFonts.
 * @slot The glyph of the icon to display.
 */

import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BooleanParser, StringParser } from 'gs-tools/export/parse';
import { ImmutableMap, ImmutableSet } from 'gs-tools/src/immutable';
import { BooleanType, HasPropertiesType, InstanceofType, NullableType, StringType } from 'gs-types/export';
import { AriaRole } from 'persona/export/a11y';
import { attribute, classlist, element, resolveLocators, shadowHost } from 'persona/export/locator';
import { _p, _v } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { IconConfig } from './icon-config';
import iconTemplate from './icon.html';
import { $defaultIconFont, $registeredFonts, FontConfig } from './registered-font';

export const $ = resolveLocators({
  host: {
    ariaHidden: attribute(shadowHost, 'aria-hidden', BooleanParser, BooleanType, true),
    el: shadowHost,
    iconFamily: attribute(shadowHost, 'icon-family', StringParser, StringType, ''),
    role: attribute(shadowHost, 'role', StringParser, StringType, AriaRole.PRESENTATION),
  },
  link: {
    el: element('#link', InstanceofType(HTMLLinkElement)),
    href: attribute(element('link.el'), 'href', StringParser, StringType, ''),
  },
  root: {
    classList: classlist(element('root.el')),
    el: element('#root', InstanceofType(HTMLSpanElement)),
  },
});

const FontConfigType = HasPropertiesType<FontConfig>({
  iconClass: StringType,
  url: InstanceofType(URL),
});
const $fontConfig = instanceStreamId('fontConfig', NullableType(FontConfigType));

@_p.customElement({
  tag: 'mk-icon',
  template: iconTemplate,
})
export class Icon extends ThemedCustomElementCtrl {
  @_p.render($.host.ariaHidden) ariaHidden_: boolean = true;
  @_p.render($.host.role) role_: AriaRole = AriaRole.PRESENTATION;

  @_v.vineOut($fontConfig)
  providesFontConfig_(
      @_v.vineIn($defaultIconFont) defaultIconFont: string,
      @_p.input($.host.iconFamily) iconFamily: string,
      @_v.vineIn($registeredFonts)
          registeredFonts: ImmutableMap<string, FontConfig>): FontConfig|null {
    return registeredFonts.get(iconFamily) || registeredFonts.get(defaultIconFont) || null;
  }

  @_p.render($.link.href)
  renderLinkHref_(
      @_v.vineIn($fontConfig) fontConfig: FontConfig|null): string {
    if (!fontConfig) {
      return '';
    }

    return fontConfig.url.toString();
  }

  @_p.render($.root.classList)
  renderRootClassList_(
      @_v.vineIn($fontConfig) fontConfig: FontConfig|null,
      @_p.input($.root.classList) existingClasses: ImmutableSet<string>):
      ImmutableSet<string> {
    if (!fontConfig) {
      return ImmutableSet.of();
    }

    return existingClasses.add(fontConfig.iconClass);
  }
}

export function icon(
    defaultIconFont: string,
    registeredFonts: ImmutableMap<string, FontConfig>):
    IconConfig {
  return {
    configure(vine: VineImpl): void {
      vine.setValue($registeredFonts, registeredFonts);
      vine.setValue($defaultIconFont, defaultIconFont);
    },
    tag: 'mk-icon',
  };
}

_v.builder.onRun(vine => {
  vine.getObservable($registeredFonts)
      .subscribe(
          registeredFonts => {
            for (const [key, config] of registeredFonts) {
              const linkId = `mkIconFamily_${key}`;
              // tslint:disable-next-line:no-non-null-assertion
              const el = (document.head!.querySelector(`${linkId}`) as HTMLLinkElement|null)
                  || createLinkEl(linkId);
              el.href = config.url.toString();
            }
          },
      );
});

function createLinkEl(id: string): HTMLLinkElement {
  const el = document.createElement('link');
  el.id = id;
  el.rel = 'stylesheet';
  // tslint:disable-next-line:no-non-null-assertion
  document.head!.appendChild(el);

  return el;
}
