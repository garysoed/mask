import {source} from 'grapevine';
import {RenderSpec} from 'persona';
import {Observable, BehaviorSubject} from 'rxjs';

export enum Anchor {
  START = 's',
  MIDDLE = 'm',
  END = 'e',
}

export interface AnchorSpec {
  readonly horizontal: Anchor;
  readonly vertical: Anchor;
}

export interface ShowSpec {
  readonly contentRenderSpec: RenderSpec;
  readonly contentAnchor: AnchorSpec;
  readonly target: Element;
  readonly targetAnchor: AnchorSpec;
}

export class OverlayService {
  readonly #shownSpec$ = new BehaviorSubject<ShowSpec|null>(null);

  get shownSpec$(): Observable<ShowSpec|null> {
    return this.#shownSpec$;
  }

  show(event: ShowSpec|null): void {
    this.#shownSpec$.next(event);
  }
}

export const $overlayService = source(() => new OverlayService());
