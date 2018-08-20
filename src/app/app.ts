import { getOrRegisterApp as getOrRegisterGrapevineApp } from 'grapevine/export/main';
import { CustomElementCtrl, getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';
import { Theme } from '../theme/theme';
import { Config } from './config';

export const vineApp_ = getOrRegisterGrapevineApp('maskBase');
export const persona_ = getOrRegisterPersonaApp('maskBase', vineApp_);
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

  persona_.builder.register(ctors, vineApp_.builder);
  persona_.builder.build(customElementRegistry, vineApp_.builder.run());
}
