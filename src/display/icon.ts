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
import { CustomElementCtrl } from 'persona/export/main';
import { persona_, vine_ } from '../app/app';
import iconTemplate from './icon.html';
import { $defaultIconFont, $registeredFonts, FontConfig } from './registered-font';

const $ = resolveLocators({
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

@persona_.customElement({
  tag: 'mk-icon',
  template: iconTemplate,
  watch: [
    $.host.iconFamily,
    $.link.el,
    $.link.href,
    $.root.classList,
    $.root.el,
  ],
})
export class Icon extends CustomElementCtrl {
  @persona_.render($.host.ariaHidden) ariaHidden_: boolean = true;
  @persona_.render($.host.role)role_: AriaRole = AriaRole.PRESENTATION;

  init(vine: VineImpl): void {
    // Noop
  }

  @vine_.vineOut($fontConfig)
  providesFontConfig_(
      @vine_.vineIn($defaultIconFont) defaultIconFont: string,
      @persona_.input($.host.iconFamily) iconFamily: string,
      @vine_.vineIn($registeredFonts)
          registeredFonts: ImmutableMap<string, FontConfig>): FontConfig|null {
    return registeredFonts.get(iconFamily) || registeredFonts.get(defaultIconFont) || null;
  }

  @persona_.render($.link.href)
  renderLinkHref_(
      @vine_.vineIn($fontConfig) fontConfig: FontConfig|null): string {
    if (!fontConfig) {
      return '';
    }

    return fontConfig.url.toString();
  }

  @persona_.render($.root.classList)
  renderRootClassList_(
      @vine_.vineIn($fontConfig) fontConfig: FontConfig|null,
      @persona_.input($.root.classList) existingClasses: ImmutableSet<string>):
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
    {ctor: typeof Icon; configure(vine: VineImpl): void} {
  return {
    ctor: Icon,
    configure(vine: VineImpl): void {
      vine.setValue($registeredFonts, registeredFonts);
      vine.setValue($defaultIconFont, defaultIconFont);
    },
  };
}

vine_.builder.onRun(vine => {
  vine.listen(registeredFonts => {
    for (const [key, config] of registeredFonts) {
      const linkId = `mkIconFamily_${key}`;
      const el = (document.head.querySelector(`${linkId}`) as HTMLLinkElement|null)
          || createLinkEl(linkId);
      el.href = config.url.toString();
    }
  }, $registeredFonts);
});

function createLinkEl(id: string): HTMLLinkElement {
  const el = document.createElement('link');
  el.id = id;
  el.rel = 'stylesheet';
  document.head.appendChild(el);

  return el;
}
