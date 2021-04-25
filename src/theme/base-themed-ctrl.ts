import {BaseCtrl, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map, pairwise, startWith, tap} from 'rxjs/operators';

import {$themeLoader, _p} from '../app/app';


@_p.baseCustomElement({})
export abstract class BaseThemedCtrl<S extends {}> extends BaseCtrl<S> {
  protected readonly themeLoader$ = $themeLoader.get(this.vine);

  constructor(context: PersonaContext, specs: S) {
    super(context, specs);

    this.addSetup(this.setupThemeUpdate());
  }

  private setupThemeUpdate(): Observable<unknown> {
    // TODO: Replace with Persona's single.
    return this.themeLoader$.pipe(
        map(themeLoader => themeLoader.createElement(this.shadowRoot.ownerDocument)),
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
