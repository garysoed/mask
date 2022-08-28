import {cache} from 'gs-tools/export/data';
import {enumType, instanceofType, nullType, Type, unionType} from 'gs-types';
import {Context, Ctrl, iattr, icall, ivalue, query, registerCustomElement, renderTemplate, SLOT} from 'persona';
import {combineLatest, Observable, of, OperatorFunction} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {$overlayService, Anchor} from '../core/overlay-service';
import {renderTheme} from '../theme/render-theme';

import template from './overlay-layout.html';

const TEMPLATE_ELEMENT_TYPE: Type<HTMLTemplateElement> = instanceofType(HTMLTemplateElement);


const $overlayLayout = {
  host: {
    contentHorizontal: iattr('content-horizontal'),
    contentVertical: iattr('content-vertical'),
    showFn: icall('showFn', []),
    target: ivalue('target', unionType([instanceofType(Element), nullType]), null),
    targetHorizontal: iattr('target-horizontal'),
    targetVertical: iattr('target-vertical'),
  },
  shadow: {
    slot: query('#slot', SLOT),
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
            contentNode$,
            anchors$,
        ),
        tap(([, targetEl, contentNode, anchors]) => {
          const rootContent = contentNode?.firstChild ?? null;
          TEMPLATE_ELEMENT_TYPE.assert(rootContent);

          overlayService.show({
            contentRenderSpec: renderTemplate({
              template$: of(rootContent),
              spec: {},
            }),
            contentAnchor: {
              horizontal: anchors.contentHorizontal ?? Anchor.START,
              vertical: anchors.contentVertical ?? Anchor.START,
            },
            target: targetEl ?? document.body,
            targetAnchor: {
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