import {Vine, source} from 'grapevine';
import {PersonaBuilder} from 'persona';
import {BaseCtrlCtor, CustomElementCtrlCtor} from 'persona/export/internal';
import {BehaviorSubject} from 'rxjs';
import {map, pairwise, startWith} from 'rxjs/operators';

import {PALETTE} from '../theme/palette';
import {Theme} from '../theme/theme';


export const _p = new PersonaBuilder();

export const $theme = source(
    'Theme',
    () => new BehaviorSubject(new Theme(document, PALETTE.ORANGE, PALETTE.GREEN)),
);
export const $window = source('window', () => window);

export function start(
    appName: string,
    rootCtrls: ReadonlyArray<CustomElementCtrlCtor|BaseCtrlCtor>,
    rootDoc: Document,
    theme: Theme,
    body: HTMLElement,
    customElementRegistry: CustomElementRegistry = window.customElements,
): {vine: Vine} {
  const vine = new Vine({appName});
  _p.build({rootCtrls, rootDoc, customElementRegistry, vine});
  const theme$ = $theme.get(vine);
  theme$.next(theme);
  theme$
      .pipe(
          map(theme => {
            const el = rootDoc.createElement('style');
            el.innerHTML = theme.generateCss();
            return el;
          }),
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
