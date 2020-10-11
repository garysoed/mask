import { source } from 'grapevine';
import { Observable, Subject } from 'rxjs';

export interface ShowEvent {
  readonly target: Element;
  readonly nodes: DocumentFragment;
}

export class OverlayService {
  readonly #onShow$ = new Subject<ShowEvent>();

  get onShow$(): Observable<ShowEvent> {
    return this.#onShow$;
  }

  show(target: Element, nodes: DocumentFragment): void {
    this.#onShow$.next({target, nodes});
  }
}

export const $overlayService = source('OverlayService', () => new OverlayService());
