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

export function addToMapConfig_(map: Map<string, Config>, config: Config): void {
  const existingConfig = map.get(config.tag);
  if (existingConfig && existingConfig !== config) {
    throw Errors.assert(`Config for ${config.tag}`).should('not be defined differently')
        .butNot();
  }

  map.set(config.tag, config);
}

export function flattenConfigs_(configs: Config[]): ImmutableMap<string, Config> {
  const map = new Map<string, Config>();
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
    rootCtrls: Array<new (...args: any[]) => CustomElementCtrl>,
    configs: Config[],
    theme: Theme,
    styleEl: HTMLStyleElement,
    customElementRegistry: CustomElementRegistry = window.customElements): {vine: VineImpl} {
  const flattenedConfigs = flattenConfigs_(configs);

  const {vine} = _p.builder.build(rootCtrls, customElementRegistry, _v.builder);
  vine.setValue($theme, theme);

  for (const [, {configure}] of flattenedConfigs) {
    if (configure) {
      configure(vine);
    }
  }

  vine.getObservable($theme).subscribe(theme => theme.injectCss(styleEl));

  return {vine};
}
