import { Observable, combineLatest } from 'rxjs';
import { PersonaContext, attributeIn, element, enumParser, handler, host, slotted, stringParser } from 'persona';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { $overlayService, Anchor } from '../core/overlay-service';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { _p } from '../app/app';

import template from './overlay-layout.html';


export const $overlayLayout = {
  tag: 'mk-overlay-layout',
  api: {
    contentHorizontal: attributeIn('content-horizontal', enumParser<Anchor>(Anchor), Anchor.START),
    contentVertical: attributeIn('content-vertical', enumParser<Anchor>(Anchor), Anchor.START),
    showFn: handler('show'),
    targetId: attributeIn('target-id', stringParser()),
    targetHorizontal: attributeIn('target-horizontal', enumParser<Anchor>(Anchor), Anchor.START),
    targetVertical: attributeIn('target-vertical', enumParser<Anchor>(Anchor), Anchor.START),
  },
};

export const $ = {
  host: host($overlayLayout.api),
  slot: element('slot', instanceofType(HTMLSlotElement), {
    slotted: slotted(),
  }),
};

@_p.customElement({
  ...$overlayLayout,
  template,
})
export class OverlayLayout extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.handleOnShow$);
  }

  private getTargetEl(hostEl: Element, targetId: string): Element|null {
    const rootNode = hostEl.getRootNode();
    if (!(rootNode instanceof ShadowRoot) && !(rootNode instanceof Document)) {
      return null;
    }

    return rootNode.getElementById(targetId);
  }

  @cache()
  private get handleOnShow$(): Observable<unknown> {
    const targetEl$ = this.declareInput($.host._.targetId).pipe(
        map(targetId => this.getTargetEl($.host.getSelectable(this.context), targetId ?? '')),
    );

    const contentNode$ = this.declareInput($.slot._.slotted)
        .pipe(map(slottedNodes => this.wrapContentNode(slottedNodes)));
    const anchors$ = combineLatest([
      this.declareInput($.host._.contentHorizontal),
      this.declareInput($.host._.contentVertical),
      this.declareInput($.host._.targetHorizontal),
      this.declareInput($.host._.targetVertical),
    ])
        .pipe(
            map(([contentHorizontal, contentVertical, targetHorizontal, targetVertical]) => {
              return {contentHorizontal, contentVertical, targetHorizontal, targetVertical};
            }),
        );

    return this.declareInput($.host._.showFn).pipe(
        withLatestFrom(
            $overlayService.get(this.vine),
            targetEl$,
            contentNode$,
            anchors$,
        ),
        tap(([, overlayService, targetEl, contentNode, anchors]) => {
          if (!targetEl || !contentNode) {
            return;
          }

          overlayService.show({
            content: {
              node: contentNode,
              horizontal: anchors.contentHorizontal,
              vertical: anchors.contentVertical,
            },
            target: {
              node: targetEl,
              horizontal: anchors.targetHorizontal,
              vertical: anchors.targetVertical,
            },
          });
        }),
    );
  }

  private wrapContentNode(slottedNodes: readonly Node[]): Node|null {
    const ownerDocument = this.context.shadowRoot.ownerDocument;
    if (!ownerDocument) {
      return null;
    }

    const docFragment = ownerDocument.createDocumentFragment();
    for (const assignedNode of slottedNodes) {
      docFragment.appendChild(assignedNode.cloneNode(true));
    }

    return docFragment;
  }
}
