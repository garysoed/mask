import { InstanceofType } from '@gs-types';
import { CustomElementCtrl, element, InitFn } from '@persona';
import { combineLatest, Observable } from '@rxjs';
import { tap } from '@rxjs/operators';

import { $theme, _p } from '../app/app';

const $ = {
  theme: element('theme', InstanceofType(HTMLStyleElement), {}),
};

@_p.baseCustomElement({})
export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  protected readonly theme$ = $theme.asSubject();
  private readonly themeEl$ = _p.input($.theme, this);

  getInitFunctions(): InitFn[] {
    return [
      () => this.setupThemeUpdate(),
    ];
  }

  private setupThemeUpdate(): Observable<unknown> {
    return combineLatest([
      this.themeEl$,
      this.theme$,
    ])
    .pipe(
        tap(([el, theme]) => theme.injectCss(el)),
    );
  }
}
