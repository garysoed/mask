import { StringParser } from 'gs-tools/export/parse';
import { InstanceofType } from 'gs-tools/node_modules/gs-types/export';
import { StringType } from 'gs-types/export';
import { attribute, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { _p } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import crumbTemplate from './crumb.html';

export const $ = resolveLocators({
  host: {
    display: attribute(shadowHost, 'display', StringParser, StringType, ''),
    el: shadowHost,
    key: attribute(shadowHost, 'key', StringParser, StringType, ''),
  },
  text: {
    el: element('#text', InstanceofType(HTMLDivElement)),
    text: textContent(element('text.el')),
  },
  theme: {
    el: element('#theme', InstanceofType(HTMLStyleElement)),
  },
});

@_p.customElement({
  tag: 'mk-crumb',
  template: crumbTemplate,
  watch: [
    $.host.display,
    $.host.el,
    $.text.el,
    $.theme.el,
  ],
})
@_p.render($.text.text).withForwarding($.host.display)
class Crumb extends ThemedCustomElementCtrl {
  constructor() {
    super($.theme.el);
  }
}

export function crumb(): Config {
  return {ctor: Crumb};
}
