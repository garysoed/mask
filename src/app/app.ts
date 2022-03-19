import {source, Vine} from 'grapevine';
import {CustomElementRegistration, installCustomElements} from 'persona';
import {BehaviorSubject} from 'rxjs';
import {map, pairwise, startWith} from 'rxjs/operators';

import {ThemeMode} from '../theme/const';
import {ClassThemeLoader} from '../theme/loader/class-theme-loader';
import {ThemeLoader} from '../theme/loader/theme-loader';
import {Theme} from '../theme/theme';
import {THEME_SEEDS} from '../theme/theme-seed';


export const $themeLoader = source(
    () => new BehaviorSubject<ThemeLoader>(
        new ClassThemeLoader(new Theme({
          baseSeed: THEME_SEEDS.ORANGE,
          accentSeed: THEME_SEEDS.GREEN,
          mode: ThemeMode.LIGHT,
        })),
    ),
);
export const $window = source(() => window);

export function start(
    appName: string,
    roots: ReadonlyArray<CustomElementRegistration<HTMLElement, any>>,
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
