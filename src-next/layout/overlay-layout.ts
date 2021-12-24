import {cache} from 'gs-tools/export/data';
import {debug} from 'gs-tools/export/rxjs';
import {enumType, instanceofType, nullType, undefinedType, unionType} from 'gs-types';
import {Context, Ctrl, iattr, icall, id, registerCustomElement, SLOT} from 'persona';
import {ivalue} from 'persona/src-next/input/value';
import {combineLatest, Observable, OperatorFunction} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {$overlayService, Anchor} from '../core/overlay-service';
import {renderTheme} from '../theme/render-theme';

import template from './overlay-layout.html';


const $overlayLayout = {
  host: {
    contentHorizontal: iattr('content-horizontal'),
    contentVertical: iattr('content-vertical'),
    showFn: icall('showFn', undefinedType),
    target: ivalue('target', unionType([instanceofType(Element), nullType]), null),
    targetHorizontal: iattr('target-horizontal'),
    targetVertical: iattr('target-vertical'),
  },
  shadow: {
    slot: id('slot', SLOT),
  },
};


export class OverlayLayout implements Ctrl {
  constructor(private readonly $: Context<typeof $overlayLayout>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.handleOnShow$,
    ];
  }

  @cache()
  private get handleOnShow$(): Observable<unknown> {
    const contentNode$ = this.$.shadow.slot.slotted
        .pipe(map(slottedNodes => this.wrapContentNode(slottedNodes)));
    const anchors$ = combineLatest([
      this.$.host.contentHorizontal.pipe(checkAnchor()),
      this.$.host.contentVertical.pipe(checkAnchor()),
      this.$.host.targetHorizontal.pipe(checkAnchor()),
      this.$.host.targetVertical.pipe(checkAnchor()),
    ])
        .pipe(
            map(([contentHorizontal, contentVertical, targetHorizontal, targetVertical]) => {
              return {contentHorizontal, contentVertical, targetHorizontal, targetVertical};
            }),
        );

    const overlayService = $overlayService.get(this.$.vine);
    return this.$.host.showFn.pipe(
        withLatestFrom(
            this.$.host.target,
            contentNode$.pipe(debug(null, 'content')),
            anchors$,
        ),
        tap(([, targetEl, contentNode, anchors]) => {
          if (!contentNode) {
            return;
          }

          overlayService.show({
            content: {
              node: contentNode,
              horizontal: anchors.contentHorizontal ?? Anchor.START,
              vertical: anchors.contentVertical ?? Anchor.START,
            },
            target: {
              node: targetEl ?? document.body,
              horizontal: anchors.targetHorizontal,
              vertical: anchors.targetVertical,
            },
          });
        }),
    );
  }

  private wrapContentNode(slottedNodes: readonly Node[]): Node|null {
    const ownerDocument = this.$.shadowRoot.ownerDocument;
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


function checkAnchor(): OperatorFunction<string|null, Anchor> {
  return map(raw => {
    if (enumType<Anchor>(Anchor).check(raw)) {
      return raw;
    }

    return Anchor.START;
  });
}


export const OVERLAY_LAYOUT = registerCustomElement({
  ctrl: OverlayLayout,
  deps: [],
  spec: $overlayLayout,
  tag: 'mk-overlay-layout',
  template,
});