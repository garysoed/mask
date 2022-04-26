import {$asArray, $asMap, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {enumType, hasPropertiesType, instanceofType, tupleOfType} from 'gs-types';
import {Context, Ctrl, DIV, query, oforeach, registerCustomElement, renderCustomElement, RenderSpec} from 'persona';
import {Observable, of, pipe, Subject} from 'rxjs';
import {map, mapTo} from 'rxjs/operators';

import {BUTTON} from '../../src/action/button';
import {Anchor} from '../../src/core/overlay-service';
import {bindRadioInputToState, RADIO_INPUT} from '../../src/input/radio-input';
import {OVERLAY_LAYOUT} from '../../src/layout/overlay-layout';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState, OverlayLayoutDemoState} from '../core/demo-state';

import template from './overlay-layout.html';


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

const ANCHOR_ENTRY_TYPE = tupleOfType<[Anchor, AnchorSubjects]>([
  ANCHOR_TYPE,
  hasPropertiesType<AnchorSubjects>({
    onInitValue$: instanceofType<Subject<string|null>>(Subject),
    onClear$: instanceofType(Subject),
    onValue$: instanceofType<Subject<string|null>>(Subject),
  }),
]);

const $overlayLayoutDemo = {
  shadow: {
    overlay: query('#overlay', OVERLAY_LAYOUT),
    overlayHorizontal: query('#overlayHorizontal', DIV, {
      overlayHorizontalAnchors: oforeach('#overlayHorizontalAnchors', ANCHOR_ENTRY_TYPE),
    }),
    overlayVertical: query('#overlayVertical', DIV, {
      overlayVerticalAnchors: oforeach('#overlayVerticalAnchors', ANCHOR_ENTRY_TYPE),
    }),
    showButton: query('#target', BUTTON),
    targetHorizontal: query('#targetHorizontal', DIV, {
      targetHorizontalAnchors: oforeach('#targetHorizontalAnchors', ANCHOR_ENTRY_TYPE),
    }),
    targetVertical: query('#targetVertical', DIV, {
      targetVerticalAnchors: oforeach('#targetVerticalAnchors', ANCHOR_ENTRY_TYPE),
    }),
  },
};


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
      of([...this.overlayHorizontalObsMap.anchorSubjects]).pipe(
          this.$.shadow.overlayHorizontal.overlayHorizontalAnchors(pairs => {
            return this.renderAnchorNodes(this.overlayHorizontalObsMap.group, pairs);
          }),
      ),
      of([...this.overlayVerticalObsMap.anchorSubjects]).pipe(
          this.$.shadow.overlayHorizontal.overlayHorizontalAnchors(pairs => {
            return this.renderAnchorNodes(this.overlayVerticalObsMap.group, pairs);
          }),
      ),
      of([...this.targetHorizontalObsMap.anchorSubjects]).pipe(
          this.$.shadow.overlayHorizontal.overlayHorizontalAnchors(pairs => {
            return this.renderAnchorNodes(this.targetHorizontalObsMap.group, pairs);
          }),
      ),
      of([...this.targetVerticalObsMap.anchorSubjects]).pipe(
          this.$.shadow.overlayHorizontal.overlayHorizontalAnchors(pairs => {
            return this.renderAnchorNodes(this.targetVerticalObsMap.group, pairs);
          }),
      ),

      this.bindRadioToState('overlayHorizontalIndex', this.overlayHorizontalObsMap),
      this.bindRadioToState('overlayVerticalIndex', this.overlayVerticalObsMap),
      this.bindRadioToState('targetHorizontalIndex', this.targetHorizontalObsMap),
      this.bindRadioToState('targetVerticalIndex', this.targetVerticalObsMap),

      this.getAnchor('overlayHorizontalIndex').pipe(this.$.shadow.overlay.contentHorizontal()),
      this.getAnchor('overlayVerticalIndex').pipe(this.$.shadow.overlay.contentVertical()),
      this.getAnchor('targetHorizontalIndex').pipe(this.$.shadow.overlay.targetHorizontal()),
      this.getAnchor('targetVerticalIndex').pipe(this.$.shadow.overlay.targetVertical()),
      this.$.shadow.showButton.actionEvent.pipe(mapTo([]), this.$.shadow.overlay.showFn()),
    ];
  }

  private bindRadioToState(
      anchorIdKey: keyof OverlayLayoutDemoState,
      spec: AnchorObsSpec,
  ): Observable<unknown> {
    const bindings = $pipe(
        spec.anchorSubjects,
        $map(([, subjects]) => ({
          clearFn: () => pipe(forwardTo(subjects.onClear$), mapTo([])),
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

  private renderAnchorNodes(
      group: string,
      [anchor, subjects]: [Anchor, AnchorSubjects],
  ): Observable<RenderSpec> {
    return of(renderCustomElement({
      registration: RADIO_INPUT,
      runs: $ => [
        of(anchor).pipe($.key()),
        of(getAnchorLabel(anchor)).pipe($.label()),
        of(group).pipe($.group()),
        subjects.onInitValue$.pipe($.initValue()),
        subjects.onClear$.pipe(mapTo([]), $.clearFn()),
        of(true).pipe($.isSecondary()),
        $.value.pipe(forwardTo(subjects.onValue$)),
      ],
    }));
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
