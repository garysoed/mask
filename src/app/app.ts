import {Vine, VineBuilder, source} from 'grapevine';
import {PersonaBuilder} from 'persona';
import {BaseCtrlCtor, CustomElementCtrlCtor} from 'persona/export/internal';
import {map, pairwise, startWith} from 'rxjs/operators';

import {PALETTE} from '../theme/palette';
import {Theme} from '../theme/theme';


export const _v = new VineBuilder();
export const _p = new PersonaBuilder(_v);

export const $theme = source('Theme', () => new Theme(document, PALETTE.ORANGE, PALETTE.GREEN));
export const $window = source('window', () => window);

export function start(
    appName: string,
    rootCtrls: ReadonlyArray<CustomElementCtrlCtor|BaseCtrlCtor>,
    rootDoc: Document,
    theme: Theme,
    body: HTMLElement,
    customElementRegistry: CustomElementRegistry = window.customElements,
): {vine: Vine} {
  const {vine} = _p.build(appName, rootCtrls, rootDoc, customElementRegistry);
  $theme.set(vine, () => theme);
  $theme
      .get(vine)
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
