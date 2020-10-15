import { instanceofType } from 'gs-types';
import { element, multi, PersonaContext, renderCustomElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Button } from '../../src/action/button';
import { $simpleRadioInput, SimpleRadioInput } from '../../src/action/simple/simple-radio-input';
import { _p } from '../../src/app/app';
import { Anchor } from '../../src/core/overlay-service';
import { OverlayLayout } from '../../src/layout/overlay-layout';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';
import { DemoLayout } from '../base/demo-layout';
import { $demoState, OverlayLayoutDemoState } from '../core/demo-state';

import template from './overlay-layout.html';


export const $overlayLayoutDemo = {
  tag: 'mkd-overlay',
  api: {},
};

const $ = {
  targetHorizontal: element('targetHorizontal', instanceofType(HTMLDivElement), {
    targetHorizontalAnchors: multi('#targetHorizontalAnchors'),
  }),
  targetVertical: element('targetVertical', instanceofType(HTMLDivElement), {
    targetVerticalAnchors: multi('#targetVerticalAnchors'),
  }),
  overlayHorizontal: element('overlayHorizontal', instanceofType(HTMLDivElement), {
    overlayHorizontalAnchors: multi('#overlayHorizontalAnchors'),
  }),
  overlayVertical: element('overlayVertical', instanceofType(HTMLDivElement), {
    overlayVerticalAnchors: multi('#overlayVerticalAnchors'),
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
  }

  private getAnchorNodes(anchorIdKey: keyof OverlayLayoutDemoState): Observable<readonly Node[]> {
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
