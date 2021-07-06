import {mutablePathSource} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {MutablePath} from 'gs-tools/export/state';
import {$div, element, multi, PersonaContext, renderCustomElement, RenderSpec} from 'persona';
import {Observable, of} from 'rxjs';
import {map, mapTo} from 'rxjs/operators';

import {$button, Button} from '../../src/action/button';
import {$radioInput, RadioInput} from '../../src/action/input/radio-input';
import {_p} from '../../src/app/app';
import {Anchor} from '../../src/core/overlay-service';
import {$overlayLayout, OverlayLayout} from '../../src/layout/overlay-layout';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoState, $demoStateId, OverlayLayoutDemoState} from '../core/demo-state';

import template from './overlay-layout.html';


export const $overlayLayoutDemo = {
  tag: 'mkd-overlay',
  api: {},
};

const $ = {
  overlay: element('overlay', $overlayLayout, {}),
  overlayHorizontal: element('overlayHorizontal', $div, {
    overlayHorizontalAnchors: multi('#overlayHorizontalAnchors'),
  }),
  overlayVertical: element('overlayVertical', $div, {
    overlayVerticalAnchors: multi('#overlayVerticalAnchors'),
  }),
  target: element('target', $button, {}),
  targetHorizontal: element('targetHorizontal', $div, {
    targetHorizontalAnchors: multi('#targetHorizontalAnchors'),
  }),
  targetVertical: element('targetVertical', $div, {
    targetVerticalAnchors: multi('#targetVerticalAnchors'),
  }),
};

const ANCHORS = [Anchor.START, Anchor.MIDDLE, Anchor.END];

const targetHorizontalIndexPath = mutablePathSource(
    $demoStateId,
    demo => demo._('overlayLayoutDemo')._('targetHorizontalIndex'),
);
const targetVerticalIndexPath = mutablePathSource(
    $demoStateId,
    demo => demo._('overlayLayoutDemo')._('targetVerticalIndex'),
);
const overlayHorizontalIndexPath = mutablePathSource(
    $demoStateId,
    demo => demo._('overlayLayoutDemo')._('overlayHorizontalIndex'),
);
const overlayVerticalIndexPath = mutablePathSource(
    $demoStateId,
    demo => demo._('overlayLayoutDemo')._('overlayVerticalIndex'),
);

@_p.customElement({
  ...$overlayLayoutDemo,
  dependencies: [
    Button,
    DemoLayout,
    OverlayLayout,
    RadioInput,
  ],
  template,
})
export class OverlayLayoutDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.overlay.contentHorizontal(this.getAnchor('overlayHorizontalIndex')),
      this.renderers.overlay.contentVertical(this.getAnchor('overlayVerticalIndex')),
      this.renderers.overlay.targetHorizontal(this.getAnchor('targetHorizontalIndex')),
      this.renderers.overlay.targetVertical(this.getAnchor('targetVerticalIndex')),
      this.renderers.overlay.showFn(this.inputs.target.actionEvent.pipe(mapTo([]))),
      this.renderers.overlayHorizontal.overlayHorizontalAnchors(this.getAnchorNodes(overlayHorizontalIndexPath.get(this.vine))),
      this.renderers.overlayVertical.overlayVerticalAnchors(this.getAnchorNodes(overlayVerticalIndexPath.get(this.vine))),
      this.renderers.targetHorizontal.targetHorizontalAnchors(this.getAnchorNodes(targetHorizontalIndexPath.get(this.vine))),
      this.renderers.targetVertical.targetVerticalAnchors(this.getAnchorNodes(targetVerticalIndexPath.get(this.vine))),
    ];
  }

  private getAnchor(anchorIdKey: keyof OverlayLayoutDemoState): Observable<Anchor> {
    return $demoState.get(this.vine)
        ._('overlayLayoutDemo')
        .$(anchorIdKey)
        .pipe(map(anchor => ANCHORS[anchor ?? 0]));
  }

  private getAnchorNodes(
      objectPath: MutablePath<number|null>,
  ): Observable<readonly RenderSpec[]> {
    const specs = ANCHORS.map((anchor, index) => {
      return renderCustomElement({
        spec: $radioInput,
        inputs: {
          index,
          label: getAnchorLabel(anchor),
          stateId: objectPath,
        },
        id: index,
      });
    });
    return of(specs);
  }
}

function getAnchorLabel(anchor: Anchor): string {
  switch (anchor) {
    case Anchor.END:
      return 'End';
    case Anchor.MIDDLE:
      return 'Middle';
    case Anchor.START:
      return 'Start';
  }
}
