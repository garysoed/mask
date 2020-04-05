import { instanceofType } from 'gs-types';
import { CustomElementCtrl, element, PersonaContext } from 'persona';
import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { $theme, _p } from '../app/app';


const $ = {
  theme: element('theme', instanceofType(HTMLStyleElement), {}),
};

@_p.baseCustomElement({})
export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  protected readonly theme$ = $theme.get(this.vine);
  private readonly themeEl$ = this.declareInput($.theme);

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupThemeUpdate());
  }

  private setupThemeUpdate(): Observable<unknown> {
    return combineLatest([this.themeEl$, this.theme$])
        .pipe(tap(([el, theme]) => theme.injectCss(el)));
  }
}
