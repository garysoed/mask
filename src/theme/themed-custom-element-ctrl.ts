import { InstanceofType } from '@gs-types';
import { CustomElementCtrl, InitFn } from '@persona';
import { element } from '@persona/input';
import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { $theme, _p, _v } from '../app/app';

const $ = {
  theme: element('theme', InstanceofType(HTMLStyleElement), {}),
};

@_p.baseCustomElement({})
export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  protected readonly themeSbj = $theme.asSubject();
  private readonly themeElObs = _p.input($.theme);

  getInitFunctions(): InitFn[] {
    return [
      this.setupThemeUpdate,
    ];
  }

  private setupThemeUpdate(): Observable<unknown> {
    return combineLatest(
        this.themeElObs,
        this.themeSbj,
    )
    .pipe(
        tap(([el, theme]) => theme.injectCss(el)),
    );
  }
}
