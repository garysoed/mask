import {$stateService} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {$div, element, multi, PersonaContext, renderCustomElement, RenderSpec} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map, mapTo, switchMap} from 'rxjs/operators';

import {$button, Button} from '../../src/action/button';
import {$radioInput, RadioInput} from '../../src/action/input/radio-input';
import {_p} from '../../src/app/app';
import {Anchor} from '../../src/core/overlay-service';
import {$overlayLayout, OverlayLayout} from '../../src/layout/overlay-layout';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import {DemoLayout} from '../base/demo-layout';
import {$demoState, OverlayLayoutDemoState} from '../core/demo-state';

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
      this.renderers.overlay.contentHorizontal(this.getAnchor('$overlayHorizontalIndex')),
      this.renderers.overlay.contentVertical(this.getAnchor('$overlayVerticalIndex')),
      this.renderers.overlay.targetHorizontal(this.getAnchor('$targetHorizontalIndex')),
      this.renderers.overlay.targetVertical(this.getAnchor('$targetVerticalIndex')),
      this.renderers.overlay.showFn(this.inputs.target.actionEvent.pipe(mapTo([]))),
      this.renderers.overlayHorizontal.overlayHorizontalAnchors(this.getAnchorNodes('$overlayHorizontalIndex')),
      this.renderers.overlayVertical.overlayVerticalAnchors(this.getAnchorNodes('$overlayVerticalIndex')),
      this.renderers.targetHorizontal.targetHorizontalAnchors(this.getAnchorNodes('$targetHorizontalIndex')),
      this.renderers.targetVertical.targetVerticalAnchors(this.getAnchorNodes('$targetHorizontalIndex')),
    ];
  }

  private getAnchor(anchorIdKey: keyof OverlayLayoutDemoState): Observable<Anchor> {
    const overlayLayoutDemoState$ = $demoState.get(this.vine).pipe(
        map(demoState => demoState?.overlayLayoutDemo ?? null),
    );
    return overlayLayoutDemoState$.pipe(
        switchMap(state => {
          if (!state) {
            return observableOf(null);
          }

          return $stateService.get(this.vine).resolve(state[anchorIdKey]);
        }),
        map(anchor => ANCHORS[anchor ?? 0]),
    );
  }

  private getAnchorNodes(
      anchorIdKey: keyof OverlayLayoutDemoState,
  ): Observable<readonly RenderSpec[]> {
    return $demoState.get(this.vine).pipe(
        map(state => {
          if (!state) {
            return [];
          }

          const $anchor = state.overlayLayoutDemo[anchorIdKey];
          return ANCHORS.map((anchor, index) => {
            return renderCustomElement({
              spec: $radioInput,
              inputs: {
                index,
                label: getAnchorLabel(anchor),
                stateId: $anchor,
              },
              id: index,
            });
          });
        }),
    );
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
