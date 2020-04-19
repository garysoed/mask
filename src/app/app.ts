import { source, Vine, VineBuilder } from 'grapevine';
import { PersonaBuilder } from 'persona';
import { CustomElementCtrlCtor } from 'persona/export/internal';
import { BehaviorSubject } from 'rxjs';
import { map, pairwise, startWith } from 'rxjs/operators';

import { Palette } from '../theme/palette';
import { Theme } from '../theme/theme';

export const _v = new VineBuilder();
export const _p = new PersonaBuilder(_v);

export const $theme = source(
    () => new BehaviorSubject(new Theme(document, Palette.ORANGE, Palette.GREEN)),
    globalThis,
);

export const $window = source(() => new BehaviorSubject(window), globalThis);

export function start(
    appName: string,
    rootCtrls: CustomElementCtrlCtor[],
    rootDoc: Document,
    theme: Theme,
    body: HTMLElement,
    customElementRegistry: CustomElementRegistry = window.customElements,
): {vine: Vine} {
  const {vine} = _p.build(appName, rootCtrls, rootDoc, customElementRegistry);
  const themeSbj = $theme.get(vine);
  themeSbj.next(theme);
  themeSbj
      .pipe(
          map(theme => theme.getStyleEl().cloneNode(true) as HTMLStyleElement),
          startWith(null),
          pairwise(),
      )
      .subscribe(([oldEl, newEl]) => {
        if (oldEl) {
          oldEl.remove();
        }

        if (newEl) {
          body.appendChild(newEl);
        }
      });

  return {vine};
}
