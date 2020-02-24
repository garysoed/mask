import { Vine } from 'grapevine';
import { InstanceofType } from 'gs-types';
import { CustomElementCtrl, element } from 'persona';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { $theme, _p } from '../app/app';


const $ = {
  theme: element('theme', InstanceofType(HTMLStyleElement), {}),
};

@_p.baseCustomElement({})
export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  protected readonly theme$ = $theme.get(this.vine);
  private readonly themeEl$ = this.declareInput($.theme);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.setupThemeUpdate();
  }

  private setupThemeUpdate(): void {
    combineLatest([this.themeEl$, this.theme$])
        .pipe(takeUntil(this.onDispose$))
        .subscribe(([el, theme]) => theme.injectCss(el));
  }
}
