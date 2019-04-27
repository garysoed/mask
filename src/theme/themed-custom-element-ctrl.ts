import { InstanceofType } from '@gs-types';
import { CustomElementCtrl, element, InitFn } from '@persona';
import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { $theme, _p } from '../app/app';

const $ = {
  theme: element('theme', InstanceofType(HTMLStyleElement), {}),
};

@_p.baseCustomElement({})
export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  protected readonly themeSbj = $theme.asSubject();
  private readonly themeElObs = _p.input($.theme, this);

  private setupThemeUpdate(): Observable<unknown> {
    return combineLatest(
        this.themeElObs,
        this.themeSbj,
    )
    .pipe(
        tap(([el, theme]) => theme.injectCss(el)),
    );
  }

  getInitFunctions(): InitFn[] {
    return [
      this.setupThemeUpdate,
    ];
  }
}
