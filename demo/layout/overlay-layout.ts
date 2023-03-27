import {cache} from 'gs-tools/export/data';
import {enumType} from 'gs-types';
import {Context, Ctrl, DIV, RenderSpec, TEMPLATE, itarget, oforeach, query, registerCustomElement, renderElement, renderTemplate} from 'persona';
import {Observable, Subject, combineLatest, of} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {BUTTON} from '../../src/action/button';
import {$overlayService, Anchor, ShowSpec} from '../../src/core/overlay-service';
import {RADIO_INPUT} from '../../src/input/radio-input';
import {renderTheme} from '../../src/theme/render-theme';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState, OverlayLayoutDemoState} from '../core/demo-state';

import template from './overlay-layout.html';


const ANCHORS = [Anchor.START, Anchor.MIDDLE, Anchor.END];
const ANCHOR_TYPE = enumType<Anchor>(Anchor);

const $overlayLayoutDemo = {
  shadow: {
    overlayHorizontal: query('#overlayHorizontal', DIV, {
      overlayHorizontalAnchors: oforeach<Anchor>('#overlayHorizontalAnchors'),
    }),
    overlayVertical: query('#overlayVertical', DIV, {
      overlayVerticalAnchors: oforeach<Anchor>('#overlayVerticalAnchors'),
    }),
    showButton: query('#target', BUTTON, {
      target: itarget(),
    }),
    targetHorizontal: query('#targetHorizontal', DIV, {
      targetHorizontalAnchors: oforeach<Anchor>('#targetHorizontalAnchors'),
    }),
    targetVertical: query('#targetVertical', DIV, {
      targetVerticalAnchors: oforeach<Anchor>('#targetVerticalAnchors'),
    }),
    template: query('#template', TEMPLATE, {
      target: itarget(),
    }),
  },
};


class OverlayLayoutDemo implements Ctrl {
  private readonly state = $demoState.get(this.$.vine).overlayLayoutDemo;

  constructor(private readonly $: Context<typeof $overlayLayoutDemo>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(ANCHORS).pipe(
          this.$.shadow.overlayHorizontal.overlayHorizontalAnchors(map(anchorType => {
            return this.renderAnchorNode(
                anchorType,
                'overlayHorizontal',
                this.state.overlayHorizontalIndex,
            );
          })),
      ),
      of(ANCHORS).pipe(
          this.$.shadow.overlayVertical.overlayVerticalAnchors(map(anchorType => {
            return this.renderAnchorNode(
                anchorType,
                'overlayVertical',
                this.state.overlayVerticalIndex,
            );
          })),
      ),
      of(ANCHORS).pipe(
          this.$.shadow.targetHorizontal.targetHorizontalAnchors(map(anchorType => {
            return this.renderAnchorNode(
                anchorType,
                'targetHorizontal',
                this.state.targetHorizontalIndex,
            );
          })),
      ),
      of(ANCHORS).pipe(
          this.$.shadow.targetVertical.targetVerticalAnchors(map(anchorType => {
            return this.renderAnchorNode(
                anchorType,
                'targetVertical',
                this.state.targetVerticalIndex,
            );
          })),
      ),
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

  private get overlayEvent$(): Observable<ShowSpec> {
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

  private getAnchor(anchorIdKey: keyof OverlayLayoutDemoState): Observable<Anchor> {
    return this.state[anchorIdKey]
        .pipe(map(anchor => ANCHOR_TYPE.check(anchor) ? anchor : Anchor.START));
  }

  private renderAnchorNode(
      anchorType: Anchor,
      group: string,
      subject: Subject<string|null>,
  ): RenderSpec {
    return renderElement({
      registration: RADIO_INPUT,
      spec: {},
      runs: $ => [
        of(anchorType).pipe($.key()),
        of(getAnchorLabel(anchorType)).pipe($.label()),
        of(group).pipe($.group()),
        of(subject).pipe($.value()),
        of(true).pipe($.isSecondary()),
      ],
    });
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
