import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {element, multi, NodeWithId, PersonaContext, renderCustomElement, ValuesOf} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, mapTo, switchMap} from 'rxjs/operators';

import {$stateService} from '../../export';
import {$button, Button} from '../../src/action/button';
import {$simpleRadioInput, SimpleRadioInput} from '../../src/action/simple/simple-radio-input';
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
export class OverlayLayoutDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get values(): ValuesOf<typeof $> {
    return {
      overlay: {
        contentHorizontal: this.getAnchor('$overlayHorizontalIndex'),
        contentVertical: this.getAnchor('$overlayVerticalIndex'),
        targetHorizontal: this.getAnchor('$targetHorizontalIndex'),
        targetVertical: this.getAnchor('$targetVerticalIndex'),
        showFn: this.inputs.target.actionEvent.pipe(mapTo([])),
      },
      overlayHorizontal: {
        overlayHorizontalAnchors: this.getAnchorNodes('$overlayHorizontalIndex'),
      },
      overlayVertical: {
        overlayVerticalAnchors: this.getAnchorNodes('$overlayVerticalIndex'),
      },
      targetHorizontal: {
        targetHorizontalAnchors: this.getAnchorNodes('$targetHorizontalIndex'),
      },
      targetVertical: {
        targetVerticalAnchors: this.getAnchorNodes('$targetHorizontalIndex'),
      },
    };
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
  ): Observable<ReadonlyArray<NodeWithId<Node>>> {
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
