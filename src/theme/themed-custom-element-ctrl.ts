import { CustomElementCtrl, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { $theme, _p } from '../app/app';


@_p.baseCustomElement({})
export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  protected readonly theme$ = $theme.get(this.vine);

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupThemeUpdate());
  }

  private setupThemeUpdate(): Observable<unknown> {
    return this.theme$
        .pipe(
            tap(theme => {
              theme.injectCss(this.shadowRoot);
            }),
        );
  }
}
