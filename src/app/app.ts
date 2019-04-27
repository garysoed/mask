import { Vine, VineBuilder } from '@grapevine';
import { PersonaBuilder } from '@persona';
import { CustomElementCtrlCtor } from '@persona/internal';
import { BehaviorSubject } from 'rxjs';
import { Palette } from '../theme/palette';
import { Theme } from '../theme/theme';

export const _v = new VineBuilder();
export const _p = new PersonaBuilder(_v);

export const $theme = _v.source(
    () => new BehaviorSubject(new Theme(Palette.ORANGE, Palette.GREEN)),
    globalThis,
);

export function start(
    appName: string,
    rootCtrls: CustomElementCtrlCtor[],
    theme: Theme,
    styleEl: HTMLStyleElement,
    customElementRegistry: CustomElementRegistry = window.customElements,
): {vine: Vine} {
  const {vine} = _p.build(appName, rootCtrls, customElementRegistry);
  const themeSbj = $theme.get(vine);
  themeSbj.next(theme);
  themeSbj.subscribe(theme => theme.injectCss(styleEl));

  return {vine};
}
