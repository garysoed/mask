import {cache} from 'gs-tools/export/data';
import {filterNonNull} from 'gs-tools/export/rxjs';
import {instanceofType} from 'gs-types';
import {classToggle, element, host, NodeWithId, onDom, PersonaContext, resizeObservable, setId, single, style, ValuesOf} from 'persona';
import {combineLatest, merge, Observable} from 'rxjs';
import {filter, map, mapTo, shareReplay, startWith, switchMap} from 'rxjs/operators';
import {Logger} from 'santa';

import {_p} from '../app/app';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

import {$overlayService, Anchor, NodeSpec, ShowEvent} from './overlay-service';
import template from './overlay.html';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = new Logger('mask.Overlay');

interface Position {
  readonly left: number;
  readonly top: number;
}


export const $overlay = {
  tag: 'mk-overlay',
  api: {},
};

export const $ = {
  host: host($overlay.api),
  content: element('content', instanceofType(HTMLDivElement), {
    content: single('#content'),
    styleTop: style('top'),
    styleLeft: style('left'),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    hidden: classToggle('hidden'),
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  ...$overlay,
  template,
})
export class Overlay extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get values(): ValuesOf<typeof $> {
    return {
      root: {hidden: this.isRootHidden$},
      content: {
        content: this.overlayContent$,
        styleLeft: this.contentLeft$,
        styleTop: this.contentTop$,
      },
    };
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
      this.contentRect$,
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
  private get contentRect$(): Observable<DOMRect> {
    const contentEl = $.content.getSelectable(this.context);
    return resizeObservable(contentEl, {}).pipe(
        map(entries => {
          return entries[entries.length - 1]?.contentRect ?? null;
        }),
        filterNonNull(),
        startWith(contentEl.getBoundingClientRect()),
        shareReplay({bufferSize: 1, refCount: false}),
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
  private get overlayContent$(): Observable<NodeWithId<Node>|null> {
    return this.showStatus$.pipe(map(status => {
      if (!status) {
        return null;
      }

      return setId(status.content.node, status.content.node);
    }));
  }

  @cache()
  private get showStatus$(): Observable<ShowEvent|null> {
    const rootEl = $.root.getSelectable(this.context);
    const onShow$ = $overlayService.get(this.vine).pipe(
        switchMap(service => service.onShow$),
    );

    const onClick$ = this.inputs.root.onClick.pipe(
        filter(event => event.target === rootEl),
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
