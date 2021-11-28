import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, DIV, id, ievent, irect, itarget, osingle, ostyle, registerCustomElement, renderNode, RenderSpec} from 'persona';
import {oclass} from 'persona/src-next/output/class';
import {combineLatest, merge, Observable} from 'rxjs';
import {filter, map, mapTo, shareReplay, startWith, withLatestFrom} from 'rxjs/operators';

import {$overlayService, Anchor, NodeSpec, ShowEvent} from './overlay-service';
import template from './overlay.html';


interface Position {
  readonly left: number;
  readonly top: number;
}


const $overlay = {
  shadow: {
    content: id('content', DIV, {
      content: osingle(),
      rect: irect(),
      styleTop: ostyle('top'),
      styleLeft: ostyle('left'),
    }),
    root: id('root', DIV, {
      hidden: oclass('hidden'),
      onClick: ievent('click'),
      target: itarget(),
    }),
  },
};

class Overlay implements Ctrl {
  constructor(private readonly $: Context<typeof $overlay>) {
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.isRootHidden$.pipe(this.$.shadow.root.hidden()),
      this.overlayContent$.pipe(this.$.shadow.content.content()),
      this.contentLeft$.pipe(this.$.shadow.content.styleLeft()),
      this.contentTop$.pipe(this.$.shadow.content.styleTop()),
    ];
  }

  @cache()
  private get contentLeft$(): Observable<string> {
    return this.contentPosition$.pipe(
        map(position => {
          if (position === null) {
            return '';
          }
          return `${position.left}px`;
        }),
    );
  }

  @cache()
  private get contentPosition$(): Observable<Position|null> {
    return combineLatest([
      this.showStatus$,
      this.$.shadow.content.rect,
    ])
        .pipe(
            map(([showStatus, contentRect]) => {
              if (!showStatus) {
                return null;
              }

              const targetRect = showStatus.target.node.getBoundingClientRect();
              const targetPosition = {
                left: computeAnchorLeft(targetRect, showStatus.target),
                top: computeAnchorTop(targetRect, showStatus.target),
              };
              const contentPosition = {
                left: computeAnchorLeft(contentRect, showStatus.content),
                top: computeAnchorTop(contentRect, showStatus.content),
              };

              return {
                left: contentRect.left - contentPosition.left + targetPosition.left,
                top: contentRect.top - contentPosition.top + targetPosition.top,
              };
            }),
            shareReplay({bufferSize: 1, refCount: true}),
        );
  }

  @cache()
  private get contentTop$(): Observable<string> {
    return this.contentPosition$.pipe(
        map(position => {
          if (position === null) {
            return '';
          }
          return `${position.top}px`;
        }),
    );
  }

  @cache()
  private get isRootHidden$(): Observable<boolean> {
    return this.showStatus$.pipe(map(showStatus => !showStatus));
  }

  @cache()
  private get overlayContent$(): Observable<RenderSpec|null> {
    return this.showStatus$.pipe(map(status => {
      if (!status) {
        return null;
      }

      return renderNode({
        node: status.content.node,
        id: status.content.node,
      });
    }));
  }

  @cache()
  private get showStatus$(): Observable<ShowEvent|null> {
    const onShow$ = $overlayService.get(this.$.vine).onShow$;

    const onClick$ = this.$.shadow.root.onClick.pipe(
        withLatestFrom(this.$.shadow.root.target),
        filter(([event, rootEl]) => event.target === rootEl),
        mapTo(null),
    );

    return merge(onShow$, onClick$).pipe(
        startWith(null),
        shareReplay({bufferSize: 1, refCount: true}),
    );
  }
}

function computeAnchorLeft(elRect: DOMRect, nodeSpec: NodeSpec<any>): number {
  switch (nodeSpec.horizontal) {
    case Anchor.START:
      return elRect.left;
    case Anchor.MIDDLE:
      return elRect.left + elRect.width / 2;
    case Anchor.END:
      return elRect.right;
  }
}

function computeAnchorTop(elRect: DOMRect, nodeSpec: NodeSpec<any>): number {
  switch (nodeSpec.vertical) {
    case Anchor.START:
      return elRect.top;
    case Anchor.MIDDLE:
      return elRect.top + elRect.height / 2;
    case Anchor.END:
      return elRect.bottom;
  }
}

export const OVERLAY = registerCustomElement({
  ctrl: Overlay,
  spec: $overlay,
  tag: 'mk-overlay',
  template,
});