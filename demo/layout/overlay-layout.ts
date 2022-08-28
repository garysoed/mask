import {$asArray, $asMap, $map} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {$pipe} from 'gs-tools/export/typescript';
import {enumType} from 'gs-types';
import {Context, Ctrl, DIV, itarget, oforeach, query, registerCustomElement, renderElement, RenderSpec, renderTemplate, TEMPLATE} from 'persona';
import {combineLatest, Observable, of, pipe, Subject} from 'rxjs';
import {map, mapTo, tap, withLatestFrom} from 'rxjs/operators';

import {BUTTON} from '../../src/action/button';
import {$overlayService, Anchor, ShowEvent} from '../../src/core/overlay-service';
import {bindRadioInputToState, RADIO_INPUT} from '../../src/input/radio-input';
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

const $overlayLayoutDemo = {
  shadow: {
    overlayHorizontal: query('#overlayHorizontal', DIV, {
      overlayHorizontalAnchors: oforeach<[Anchor, AnchorSubjects]>('#overlayHorizontalAnchors'),
    }),
    overlayVertical: query('#overlayVertical', DIV, {
      overlayVerticalAnchors: oforeach<[Anchor, AnchorSubjects]>('#overlayVerticalAnchors'),
    }),
    showButton: query('#target', BUTTON, {
      target: itarget(),
    }),
    targetHorizontal: query('#targetHorizontal', DIV, {
      targetHorizontalAnchors: oforeach<[Anchor, AnchorSubjects]>('#targetHorizontalAnchors'),
    }),
    targetVertical: query('#targetVertical', DIV, {
      targetVerticalAnchors: oforeach<[Anchor, AnchorSubjects]>('#targetVerticalAnchors'),
    }),
    template: query('#template', TEMPLATE, {
      target: itarget(),
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
          this.$.shadow.overlayHorizontal.overlayHorizontalAnchors(map(pairs => {
            return this.renderAnchorNodes(this.overlayHorizontalObsMap.group, pairs);
          })),
      ),
      of([...this.overlayVerticalObsMap.anchorSubjects]).pipe(
          this.$.shadow.overlayVertical.overlayVerticalAnchors(map(pairs => {
            return this.renderAnchorNodes(this.overlayVerticalObsMap.group, pairs);
          })),
      ),
      of([...this.targetHorizontalObsMap.anchorSubjects]).pipe(
          this.$.shadow.targetHorizontal.targetHorizontalAnchors(map(pairs => {
            return this.renderAnchorNodes(this.targetHorizontalObsMap.group, pairs);
          })),
      ),
      of([...this.targetVerticalObsMap.anchorSubjects]).pipe(
          this.$.shadow.targetVertical.targetVerticalAnchors(map(pairs => {
            return this.renderAnchorNodes(this.targetVerticalObsMap.group, pairs);
          })),
      ),

      this.bindRadioToState('overlayHorizontalIndex', this.overlayHorizontalObsMap),
      this.bindRadioToState('overlayVerticalIndex', this.overlayVerticalObsMap),
      this.bindRadioToState('targetHorizontalIndex', this.targetHorizontalObsMap),
      this.bindRadioToState('targetVerticalIndex', this.targetVerticalObsMap),
      this.handleClick(),
    ];
  }

  private handleClick(): Observable<unknown> {
    return this.$.shadow.showButton.actionEvent.pipe(
        withLatestFrom(this.overlayEvent$),
        tap(([, showEvent]) => {
          $overlayService.get(this.$.vine).show(showEvent);
        }),
    );
  }

  private get overlayEvent$(): Observable<ShowEvent> {
    return combineLatest([
      this.$.shadow.showButton.target,
      this.getAnchor('overlayHorizontalIndex'),
      this.getAnchor('overlayVerticalIndex'),
      this.getAnchor('targetHorizontalIndex'),
      this.getAnchor('targetVerticalIndex'),
    ])
        .pipe(
            map(([target, contentH, contentV, targetH, targetV]) => ({
              contentAnchor: {
                horizontal: contentH,
                vertical: contentV,
              },
              contentRenderSpec: renderTemplate({
                template$: this.$.shadow.template.target,
                spec: {},
              }),
              target,
              targetAnchor: {
                horizontal: targetH,
                vertical: targetV,
              },
            })),
        );
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
  ): RenderSpec {
    return renderElement({
      registration: RADIO_INPUT,
      spec: {},
      runs: $ => [
        of(anchor).pipe($.key()),
        of(getAnchorLabel(anchor)).pipe($.label()),
        of(group).pipe($.group()),
        subjects.onInitValue$.pipe($.initValue()),
        subjects.onClear$.pipe(mapTo([]), $.clearFn()),
        of(true).pipe($.isSecondary()),
        $.value.pipe(forwardTo(subjects.onValue$)),
      ],
    });
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
    RADIO_INPUT,
  ],
  spec: $overlayLayoutDemo,
  tag: 'mkd-overlay',
  template,
});
