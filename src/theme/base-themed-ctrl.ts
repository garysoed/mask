import {BaseCtrl, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map, pairwise, startWith, tap} from 'rxjs/operators';

import {$theme, _p} from '../app/app';


@_p.baseCustomElement({})
export abstract class BaseThemedCtrl<S extends {}> extends BaseCtrl<S> {
  protected readonly theme$ = $theme.get(this.vine);

  constructor(context: PersonaContext, specs: S) {
    super(context, specs);

    this.addSetup(this.setupThemeUpdate());
  }

  private setupThemeUpdate(): Observable<unknown> {
    // TODO: Replace with Persona's single.
    return this.theme$.pipe(
        map(theme => {
          const el = this.context.shadowRoot.ownerDocument.createElement('style');
          el.innerHTML = theme.generateCss();
          return el;
        }),
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
