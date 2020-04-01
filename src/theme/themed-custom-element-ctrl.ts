import { instanceofType } from 'gs-types';
import { CustomElementCtrl, element, PersonaContext } from 'persona';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

    this.setupThemeUpdate();
  }

  private setupThemeUpdate(): void {
    combineLatest([this.themeEl$, this.theme$])
        .pipe(takeUntil(this.onDispose$))
        .subscribe(([el, theme]) => theme.injectCss(el));
  }
}
