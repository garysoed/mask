import {source} from 'grapevine';
import {RenderSpec} from 'persona';
import {Observable, Subject} from 'rxjs';

export enum Anchor {
  START = 's',
  MIDDLE = 'm',
  END = 'e',
}

export interface AnchorSpec {
  readonly horizontal: Anchor;
  readonly vertical: Anchor;
}

export interface ShowEvent {
  readonly contentRenderSpec: RenderSpec;
  readonly contentAnchor: AnchorSpec;
  readonly target: Element;
  readonly targetAnchor: AnchorSpec;
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

export const $overlayService = source(() => new OverlayService());
