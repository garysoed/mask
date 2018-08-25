import { getOrRegisterApp as getOrRegisterGrapevineApp } from 'grapevine/export/main';
import { CustomElementCtrl, getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';
import { Theme } from '../theme/theme';
import { Config } from './config';

export const vine_ = getOrRegisterGrapevineApp('maskBase');
export const persona_ = getOrRegisterPersonaApp('maskBase', vine_);
export function start(
    configs: Config[],
    theme: Theme,
    customElementRegistry: CustomElementRegistry = window.customElements,
    document: Document = window.document): void {
  theme.injectCss(document);

  const ctors = [];
  for (const {ctor} of configs) {
    ctors.push(ctor);
  }

  const vine = vine_.builder.run();
  persona_.builder.build(ctors, customElementRegistry, vine);

  for (const {configure} of configs) {
    if (configure) {
      configure(vine);
    }
  }
}
