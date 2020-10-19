import { instanceofType } from 'gs-types';
import { element, multi, NodeWithId, PersonaContext, renderCustomElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, mapTo, switchMap } from 'rxjs/operators';

import { $stateService } from '../../export';
import { $button, Button } from '../../src/action/button';
import { $simpleRadioInput, SimpleRadioInput } from '../../src/action/simple/simple-radio-input';
import { _p } from '../../src/app/app';
import { Anchor } from '../../src/core/overlay-service';
import { $overlayLayout, OverlayLayout } from '../../src/layout/overlay-layout';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';
import { DemoLayout } from '../base/demo-layout';
import { $demoState, OverlayLayoutDemoState } from '../core/demo-state';

import template from './overlay-layout.html';


export const $overlayLayoutDemo = {
  tag: 'mkd-overlay',
  api: {},
};

const $ = {
  overlay: element('overlay', $overlayLayout, {}),
  overlayHorizontal: element('overlayHorizontal', instanceofType(HTMLDivElement), {
    overlayHorizontalAnchors: multi('#overlayHorizontalAnchors'),
  }),
  overlayVertical: element('overlayVertical', instanceofType(HTMLDivElement), {
    overlayVerticalAnchors: multi('#overlayVerticalAnchors'),
  }),
  target: element('target', $button, {}),
  targetHorizontal: element('targetHorizontal', instanceofType(HTMLDivElement), {
    targetHorizontalAnchors: multi('#targetHorizontalAnchors'),
  }),
  targetVertical: element('targetVertical', instanceofType(HTMLDivElement), {
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
    SimpleRadioInput,
  ],
  template,
})
export class OverlayLayoutDemo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render(
        $.overlayHorizontal._.overlayHorizontalAnchors,
        this.getAnchorNodes('$overlayHorizontalIndex'),
    );
    this.render(
        $.overlayVertical._.overlayVerticalAnchors,
        this.getAnchorNodes('$overlayVerticalIndex'),
    );
    this.render(
        $.targetHorizontal._.targetHorizontalAnchors,
        this.getAnchorNodes('$targetHorizontalIndex'),
    );
    this.render(
        $.targetVertical._.targetVerticalAnchors,
        this.getAnchorNodes('$targetVerticalIndex'),
    );
    this.render($.overlay._.showFn, this.declareInput($.target._.actionEvent).pipe(mapTo([])));
    this.render($.overlay._.contentHorizontal, this.getAnchor('$overlayHorizontalIndex'));
    this.render($.overlay._.contentVertical, this.getAnchor('$overlayVerticalIndex'));
    this.render($.overlay._.targetHorizontal, this.getAnchor('$targetHorizontalIndex'));
    this.render($.overlay._.targetVertical, this.getAnchor('$targetVerticalIndex'));
  }

  private getAnchor(anchorIdKey: keyof OverlayLayoutDemoState): Observable<Anchor> {
    const overlayLayoutDemoState$ = $demoState.get(this.vine).pipe(
        map(demoState => demoState?.overlayLayoutDemo ?? null),
    );
    return combineLatest([overlayLayoutDemoState$, $stateService.get(this.vine)]).pipe(
        switchMap(([state, stateService]) => {
          if (!state) {
            return observableOf(null);
          }

          return stateService.get(state[anchorIdKey]);
        }),
        map(anchor => ANCHORS[anchor ?? 0]),
    );
  }

  private getAnchorNodes(
      anchorIdKey: keyof OverlayLayoutDemoState,
  ): Observable<readonly NodeWithId[]> {
    return $demoState.get(this.vine).pipe(
        switchMap(state => {
          if (!state) {
            return observableOf([]);
          }

          const $anchor = state.overlayLayoutDemo[anchorIdKey];
          const node$list = ANCHORS.map((anchor, index) => {
            return renderCustomElement(
                $simpleRadioInput,
                {
                  inputs: {
                    index: observableOf(index),
                    label: observableOf(getAnchorLabel(anchor)),
                    stateId: observableOf($anchor),
                  },
                },
                index,
                this.context,
            );
          });
          return combineLatest(node$list);
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
