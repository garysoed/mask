import { staticSourceId } from 'grapevine/export/component';
import { getOrRegisterApp as getOrRegisterGrapevineApp, VineImpl } from 'grapevine/export/main';
import { InstanceofType } from 'gs-types/export';
import { CustomElementCtrl, getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';
import { Palette } from '../theme/palette';
import { Theme } from '../theme/theme';

export const _v = getOrRegisterGrapevineApp('maskBase');
export const _p = getOrRegisterPersonaApp('maskBase', _v);

export const $theme = staticSourceId('theme', InstanceofType(Theme));
_v.builder.source($theme, new Theme(Palette.ORANGE, Palette.GREEN));

export function start(
    rootCtrls: Array<new (...args: any[]) => CustomElementCtrl>,
    theme: Theme,
    styleEl: HTMLStyleElement,
    customElementRegistry: CustomElementRegistry = window.customElements): {vine: VineImpl} {
  const {vine} = _p.builder.build(rootCtrls, customElementRegistry, _v.builder);
  vine.setValue($theme, theme);

  vine.getObservable($theme).subscribe(theme => theme.injectCss(styleEl));

  return {vine};
}
