import {BaseCtrl, InternalElementSpec, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map, pairwise, startWith, tap} from 'rxjs/operators';

import {$theme, _p} from '../app/app';


@_p.baseCustomElement({})
export abstract class BaseThemedCtrl<S extends InternalElementSpec> extends BaseCtrl<S> {
  protected readonly theme$ = $theme.get(this.vine);

  constructor(context: PersonaContext, internalElementSpec: S) {
    super(context, internalElementSpec);

    this.addSetup(this.setupThemeUpdate());
  }

  private setupThemeUpdate(): Observable<unknown> {
    return this.theme$.pipe(
        map(theme => theme.getStyleEl().cloneNode(true) as HTMLStyleElement),
        startWith(null),
        pairwise(),
        tap(([oldEl, newEl]) => {
          if (oldEl) {
            oldEl.remove();
          }

          if (newEl) {
            this.shadowRoot.appendChild(newEl);
          }
        }),
    );
  }
}
