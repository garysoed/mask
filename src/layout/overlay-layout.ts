import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {attributeIn, element, enumParser, handler, host, PersonaContext, slotted, stringParser} from 'persona';
import {combineLatest, Observable} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {_p} from '../app/app';
import {$overlayService, Anchor} from '../core/overlay-service';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

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
export class OverlayLayout extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(this.handleOnShow$);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
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
    const targetEl$ = this.inputs.host.targetId.pipe(
        map(targetId => this.getTargetEl($.host.getSelectable(this.context), targetId ?? '')),
    );

    const contentNode$ = this.inputs.slot.slotted
        .pipe(map(slottedNodes => this.wrapContentNode(slottedNodes)));
    const anchors$ = combineLatest([
      this.inputs.host.contentHorizontal,
      this.inputs.host.contentVertical,
      this.inputs.host.targetHorizontal,
      this.inputs.host.targetVertical,
    ])
        .pipe(
            map(([contentHorizontal, contentVertical, targetHorizontal, targetVertical]) => {
              return {contentHorizontal, contentVertical, targetHorizontal, targetVertical};
            }),
        );

    return this.inputs.host.showFn.pipe(
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
