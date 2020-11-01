import { Observable, Subject } from 'rxjs';
import { source } from 'grapevine';

export enum Anchor {
  START = 's',
  MIDDLE = 'm',
  END = 'e',
}

export interface NodeSpec<E> {
  readonly node: E;
  readonly horizontal: Anchor;
  readonly vertical: Anchor;
}

export interface ShowEvent {
  readonly target: NodeSpec<Element>;
  readonly content: NodeSpec<Node>;
}

export class OverlayService {
  readonly #onShow$ = new Subject<ShowEvent>();

  get onShow$(): Observable<ShowEvent> {
    return this.#onShow$;
  }

  show(event: ShowEvent): void {
    this.#onShow$.next(event);
  }
}

export const $overlayService = source('OverlayService', () => new OverlayService());
