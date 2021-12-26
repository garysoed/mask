import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, id, registerCustomElement, renderCustomElement, RenderSpec, RenderSpecType, renderTextNode} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerSvg} from '../../src-next/core/svg-service';
import {ANNOTATED_TEXT} from '../../src-next/display/annotated-text';
import {ICON} from '../../src-next/display/icon';
import {renderTheme} from '../../src-next/theme/render-theme';
import smileySvg from '../asset/smiley.svg';
import {DEMO_LAYOUT} from '../core/demo-layout';

import template from './annotated-text.html';


const $annotatedTextDemo = {
  shadow: {
    annotated: id('annotated', ANNOTATED_TEXT),
  },
};

export class AnnotatedTextDemo implements Ctrl {
  constructor(private readonly $: Context<typeof $annotatedTextDemo>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of([renderEmoji]).pipe(this.$.shadow.annotated.annotations()),
    ];
  }
}

const emojiRegex = /:([a-zA-Z]*)/;

function renderEmoji(initSpec: RenderSpec): Observable<readonly RenderSpec[]> {
  if (initSpec.type !== RenderSpecType.TEXT_NODE) {
    return of([initSpec]);
  }

  return initSpec.textContent.pipe(
      map(text => {
        const match = text.match(emojiRegex);
        if (!match) {
          return [initSpec];
        }

        const firstNode = renderTextNode({
          textContent: text.substring(0, match.index ?? 0),
          id: {},
        });

        const imgNode = renderCustomElement({
          registration: ICON,
          attrs: new Map([
            ['style', 'display: inline-block;height: 2rem;'],
          ]),
          inputs: {
            icon: match[1],
          },
          id: {},
        });

        const lastNode = renderTextNode({
          textContent: text.substring((match.index ?? 0) + match[0].length),
          id: {},
        });

        return [firstNode, imgNode, lastNode];
      }),
  );
}

export const ANNOTATED_TEXT_DEMO = registerCustomElement({
  configure: vine => {
    registerSvg(vine, 'smiley', {type: 'embed', content: smileySvg});
  },
  ctrl: AnnotatedTextDemo,
  deps: [
    ANNOTATED_TEXT,
    DEMO_LAYOUT,
    ICON,
  ],
  spec: $annotatedTextDemo,
  tag: 'mkd-annotated-text',
  template,
});