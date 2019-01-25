import { InstanceofType } from 'gs-types/export';
import { element } from 'persona/export/input';
import { CustomElementCtrl } from 'persona/export/main';
import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { $theme, _p, _v } from '../app/app';
import { Theme } from './theme';

const $ = {
  theme: element('theme', InstanceofType(HTMLStyleElement), {}),
};

@_p.baseCustomElement({})
export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  @_p.onCreate()
  injectCss_(
      @_p.input($.theme) themeElObs: Observable<HTMLStyleElement>,
      @_v.vineIn($theme) themeObs: Observable<Theme>,
  ): Observable<unknown> {
    return combineLatest(themeElObs, themeObs)
        .pipe(
            tap(([el, theme]) => theme.injectCss(el)),
        );
  }
}
