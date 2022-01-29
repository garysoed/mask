import {$asArray, $asMap, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {enumType} from 'gs-types';
import {Context, Ctrl, DIV, id, omulti, registerCustomElement, renderCustomElement, RenderSpec} from 'persona';
import {Observable, of, Subject} from 'rxjs';
import {map, mapTo} from 'rxjs/operators';

import {BUTTON} from '../../src/action/button';
import {Anchor} from '../../src/core/overlay-service';
import {bindRadioInputToState, RADIO_INPUT} from '../../src/input/radio-input';
import {OVERLAY_LAYOUT} from '../../src/layout/overlay-layout';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState, OverlayLayoutDemoState} from '../core/demo-state';

import template from './overlay-layout.html';


const $overlayLayoutDemo = {
  shadow: {
    overlay: id('overlay', OVERLAY_LAYOUT),
    overlayHorizontal: id('overlayHorizontal', DIV, {
      overlayHorizontalAnchors: omulti('#overlayHorizontalAnchors'),
    }),
    overlayVertical: id('overlayVertical', DIV, {
      overlayVerticalAnchors: omulti('#overlayVerticalAnchors'),
    }),
    showButton: id('target', BUTTON),
    targetHorizontal: id('targetHorizontal', DIV, {
      targetHorizontalAnchors: omulti('#targetHorizontalAnchors'),
    }),
    targetVertical: id('targetVertical', DIV, {
      targetVerticalAnchors: omulti('#targetVerticalAnchors'),
    }),
  },
};

const ANCHORS = [Anchor.START, Anchor.MIDDLE, Anchor.END];
const ANCHOR_TYPE = enumType<Anchor>(Anchor);

interface AnchorSubjects {
  readonly onInitValue$: Subject<string|null>;
  readonly onClear$: Subject<unknown>;
  readonly onValue$: Subject<string|null>;
}

interface AnchorObsSpec {
  readonly group: string;
  readonly anchorSubjects: ReadonlyMap<Anchor, AnchorSubjects>;
}


export class OverlayLayoutDemo implements Ctrl {
  private readonly $state = $demoState.get(this.$.vine)._('overlayLayoutDemo');
  private readonly overlayHorizontalObsMap = createObsMap('overlayHorizontal');
  private readonly overlayVerticalObsMap = createObsMap('overlayVertical');
  private readonly targetHorizontalObsMap = createObsMap('targetHorizontal');
  private readonly targetVerticalObsMap = createObsMap('targetVertical');

  constructor(private readonly $: Context<typeof $overlayLayoutDemo>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.renderAnchorNodes(this.overlayHorizontalObsMap)
          .pipe(this.$.shadow.overlayHorizontal.overlayHorizontalAnchors()),
      this.renderAnchorNodes(this.overlayVerticalObsMap)
          .pipe(this.$.shadow.overlayVertical.overlayVerticalAnchors()),
      this.renderAnchorNodes(this.targetHorizontalObsMap)
          .pipe(this.$.shadow.targetHorizontal.targetHorizontalAnchors()),
      this.renderAnchorNodes(this.targetVerticalObsMap)
          .pipe(this.$.shadow.targetVertical.targetVerticalAnchors()),

      this.bindRadioToState('overlayHorizontalIndex', this.overlayHorizontalObsMap),
      this.bindRadioToState('overlayVerticalIndex', this.overlayVerticalObsMap),
      this.bindRadioToState('targetHorizontalIndex', this.targetHorizontalObsMap),
      this.bindRadioToState('targetVerticalIndex', this.targetVerticalObsMap),

      this.getAnchor('overlayHorizontalIndex').pipe(this.$.shadow.overlay.contentHorizontal()),
      this.getAnchor('overlayVerticalIndex').pipe(this.$.shadow.overlay.contentVertical()),
      this.getAnchor('targetHorizontalIndex').pipe(this.$.shadow.overlay.targetHorizontal()),
      this.getAnchor('targetVerticalIndex').pipe(this.$.shadow.overlay.targetVertical()),
      this.$.shadow.showButton.actionEvent.pipe(mapTo(undefined), this.$.shadow.overlay.showFn()),
    ];
  }

  private bindRadioToState(
      anchorIdKey: keyof OverlayLayoutDemoState,
      spec: AnchorObsSpec,
  ): Observable<unknown> {
    const bindings = $pipe(
        spec.anchorSubjects,
        $map(([, subjects]) => ({
          clearFn: () => forwardTo(subjects.onClear$),
          initValue: () => forwardTo(subjects.onInitValue$),
          value: subjects.onValue$,
        })),
        $asArray(),
    );
    return bindRadioInputToState(this.$state.$(anchorIdKey), bindings);
  }

  private getAnchor(anchorIdKey: keyof OverlayLayoutDemoState): Observable<Anchor> {
    return this.$state
        .$(anchorIdKey)
        .pipe(map(anchor => ANCHOR_TYPE.check(anchor) ? anchor : Anchor.START));
  }

  private renderAnchorNodes(spec: AnchorObsSpec): Observable<readonly RenderSpec[]> {
    const specs = $pipe(
        spec.anchorSubjects,
        $map(([anchor, subjects]) => {
          return renderCustomElement({
            registration: RADIO_INPUT,
            inputs: {
              key: of(anchor),
              label: of(getAnchorLabel(anchor)),
              group: of(spec.group),
              initValue: subjects.onInitValue$,
              clearFn: subjects.onClear$,
              isSecondary: of(true),
            },
            id: anchor,
            onOutputs: {value: subjects.onValue$},
          });
        }),
        $asArray(),
    );
    return of(specs);
  }
}

function createObsMap(group: string): AnchorObsSpec {
  const anchorSubjects = $pipe(
      ANCHORS,
      $map(anchor => {
        return [
          anchor,
          {
            onInitValue$: new Subject<string|null>(),
            onClear$: new Subject<unknown>(),
            onValue$: new Subject<string|null>(),
          },
        ] as const;
      }),
      $asMap(),
  );
  return {group, anchorSubjects};
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

export const OVERLAY_LAYOUT_DEMO = registerCustomElement({
  ctrl: OverlayLayoutDemo,
  deps: [
    BUTTON,
    DEMO_LAYOUT,
    OVERLAY_LAYOUT,
    RADIO_INPUT,
  ],
  spec: $overlayLayoutDemo,
  tag: 'mkd-overlay',
  template,
});
