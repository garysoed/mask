import { staticSourceId } from 'grapevine/export/component';
import { getOrRegisterApp as getOrRegisterGrapevineApp, VineImpl } from 'grapevine/export/main';
import { ImmutableMap } from 'gs-tools/export/collect';
import { Errors } from 'gs-tools/src/error';
import { InstanceofType } from 'gs-types/export';
import { CustomElementCtrl, getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';
import { Palette } from '../theme/palette';
import { Theme } from '../theme/theme';
import { Config } from './config';

export const _v = getOrRegisterGrapevineApp('maskBase');
export const _p = getOrRegisterPersonaApp('maskBase', _v);

export const $theme = staticSourceId('theme', InstanceofType(Theme));
_v.builder.source($theme, new Theme(Palette.ORANGE, Palette.GREEN));

export function addToMapConfig_(map: Map<typeof CustomElementCtrl, Config>, config: Config): void {
  const existingConfig = map.get(config.ctor);
  if (existingConfig && existingConfig !== config) {
    throw Errors.assert(`Config for ${config.ctor.name}`).should('not be defined differently')
        .butNot();
  }

  map.set(config.ctor, config);
}

export function flattenConfigs_(configs: Config[]): ImmutableMap<typeof CustomElementCtrl, Config> {
  const map = new Map<typeof CustomElementCtrl, Config>();
  for (const config of configs) {
    addToMapConfig_(map, config);

    const dependencies = config.dependencies || [];
    const dependencyMap = flattenConfigs_(dependencies);
    for (const [, config] of dependencyMap) {
      addToMapConfig_(map, config);
    }
  }

  return ImmutableMap.of(map);
}

export function start(
    configs: Config[],
    theme: Theme,
    styleEl: HTMLStyleElement,
    customElementRegistry: CustomElementRegistry = window.customElements): {vine: VineImpl} {
  const flattenedConfigs = flattenConfigs_(configs);

  const ctors = [];
  for (const [ctor] of flattenedConfigs) {
    ctors.push(ctor);
  }

  const vine = _v.builder.run();
  vine.setValue($theme, theme);
  _p.builder.build(ctors, customElementRegistry, vine);

  for (const [, {configure}] of flattenedConfigs) {
    if (configure) {
      configure(vine);
    }
  }

  vine.getObservable($theme).subscribe(theme => theme.injectCss(styleEl));

  return {vine};
}
