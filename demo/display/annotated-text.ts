import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, itarget, query, registerCustomElement, RenderSpecType, renderTemplate, renderTextNode, TEMPLATE} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerSvg} from '../../src/core/svg-service';
import {ANNOTATED_TEXT, AnnotationSpec} from '../../src/display/annotated-text';
import {ICON} from '../../src/display/icon';
import {renderTheme} from '../../src/theme/render-theme';
import smileySvg from '../asset/smiley.svg';
import {DEMO_LAYOUT} from '../core/demo-layout';

import template from './annotated-text.html';


const $annotatedTextDemo = {
  shadow: {
    _icon: query('#_icon', TEMPLATE, {
      target: itarget(),
    }),
    annotated: query('#annotated', ANNOTATED_TEXT),
  },
};

const emojiRegex = /:([a-zA-Z]*)/;

export class AnnotatedTextDemo implements Ctrl {
  constructor(private readonly $: Context<typeof $annotatedTextDemo>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of([this.renderEmoji()]).pipe(this.$.shadow.annotated.annotations()),
    ];
  }

  renderEmoji(): AnnotationSpec {
    return initSpec => {
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
              textContent: of(text.substring(0, match.index ?? 0)),
            });

            const imgNode = renderTemplate({
              template$: this.$.shadow._icon.target as Observable<HTMLTemplateElement>,
              spec: {
                icon: query('mk-query', ICON),
              },
              runs: $ => [of(match[1]).pipe($.icon.icon())],
            });

            const lastNode = renderTextNode({
              textContent: of(text.substring((match.index ?? 0) + match[0].length)),
            });

            return [firstNode, imgNode, lastNode];
          }),
      );
    };
  }
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