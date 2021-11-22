import {source, Vine} from 'grapevine';
import {ElementSpec, installCustomElements, Registration} from 'persona';
import {BehaviorSubject} from 'rxjs';
import {map, pairwise, startWith} from 'rxjs/operators';

import {ClassThemeLoader} from '../theme/loader/class-theme-loader';
import {ThemeLoader} from '../theme/loader/theme-loader';
import {PALETTE} from '../theme/palette';
import {Theme} from '../theme/theme';


export const $themeLoader = source(
    () => new BehaviorSubject<ThemeLoader>(
        new ClassThemeLoader(new Theme(PALETTE.ORANGE, PALETTE.GREEN)),
    ),
);
export const $window = source(() => window);

export function start(
    appName: string,
    roots: ReadonlyArray<Registration<HTMLElement, ElementSpec>>,
    rootDoc: Document,
    themeLoader: ThemeLoader,
    customElementRegistry: CustomElementRegistry = window.customElements,
): {vine: Vine} {
  const vine = new Vine({appName});
  installCustomElements({roots, rootDoc, customElementRegistry, vine});
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
