import {source, Vine} from 'grapevine';
import {PersonaBuilder} from 'persona';
import {BaseCtrlCtor} from 'persona/export/internal';
import {BehaviorSubject} from 'rxjs';
import {map, pairwise, startWith} from 'rxjs/operators';

import {ClassThemeLoader} from '../theme/loader/class-theme-loader';
import {ThemeLoader} from '../theme/loader/theme-loader';
import {PALETTE} from '../theme/palette';
import {Theme} from '../theme/theme';


export const _p = new PersonaBuilder();

export const $themeLoader = source(
    'Theme',
    () => new BehaviorSubject<ThemeLoader>(
        new ClassThemeLoader(new Theme(PALETTE.ORANGE, PALETTE.GREEN))),
);
export const $window = source('window', () => window);

export function start(
    appName: string,
    rootCtrls: ReadonlyArray<BaseCtrlCtor<{}>>,
    rootDoc: Document,
    themeLoader: ThemeLoader,
    customElementRegistry: CustomElementRegistry = window.customElements,
): {vine: Vine} {
  const vine = new Vine({appName});
  _p.build({rootCtrls, rootDoc, customElementRegistry, vine});
  const themeLoader$ = $themeLoader.get(vine);
  themeLoader$.next(themeLoader);
  themeLoader$
      .pipe(
          map(themeLoader => themeLoader.createElement(rootDoc)),
          startWith(null),
          pairwise(),
      )
      .subscribe(([oldEl, newEl]) => {
        if (oldEl) {
          oldEl.remove();
        }

        if (newEl) {
          rootDoc.head.appendChild(newEl);
        }
      });

  return {vine};
}
