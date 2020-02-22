import { DelayedObservable, Provider } from 'grapevine/export/internal';
import { InstanceofType } from 'gs-types';
import { CustomElementCtrl, element, InitFn } from 'persona';
import { Input, Output } from 'persona/export/internal';
import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { $theme, _p, _v } from '../app/app';

const $ = {
  theme: element('theme', InstanceofType(HTMLStyleElement), {}),
};

@_p.baseCustomElement({})
export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  protected readonly theme$ = $theme.asSubject();
  private readonly themeEl$ = this.declareInput($.theme);

  getInitFunctions(): readonly InitFn[] {
    return [
      () => this.setupThemeUpdate(),
    ];
  }

  protected declareInput<T>(input: Input<T>): DelayedObservable<T> {
    return _p.input(input, this);
  }

  protected renderStream<T>(output: Output<T>, renderFn: Provider<T, this>): InitFn {
    return _p.render(output).withVine(_v.stream(renderFn, this));
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
