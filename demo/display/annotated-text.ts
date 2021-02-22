import {cache} from 'gs-tools/export/data';
import {PersonaContext, renderCustomElement, RenderSpec, RenderSpecType, renderTextNode} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {_p} from '../../src/app/app';
import {registerSvg} from '../../src/core/svg-service';
import {AnnotatedText} from '../../src/display/annotated-text';
import {$annotationConfig} from '../../src/display/annotation-service';
import {$icon, Icon} from '../../src/display/icon';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import smileySvg from '../asset/smiley.svg';
import {DemoLayout} from '../base/demo-layout';

import template from './annotated-text.html';


export const $annotatedTextDemo = {
  tag: 'mkd-annotated-text',
  api: {},
};

@_p.customElement({
  ...$annotatedTextDemo,
  dependencies: [
    AnnotatedText,
    DemoLayout,
    Icon,
  ],
  template,
  configure: vine => {
    $annotationConfig.set(
        vine,
        configs => new Map([
          ...configs,
          ['emoji', renderEmoji],
        ]),
    );

    registerSvg(vine, 'smiley', {type: 'embed', content: smileySvg});
  },
})
export class AnnotatedTextDemo extends BaseThemedCtrl<{}> {
  constructor(context: PersonaContext) {
    super(context, {});
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

const emojiRegex = /:([a-zA-Z]*)/;

function renderEmoji(initSpec: RenderSpec): Observable<readonly RenderSpec[]> {
  if (initSpec.type !== RenderSpecType.TEXT_NODE) {
    return observableOf([initSpec]);
  }

  return initSpec.textContent.pipe(
      map(text => {
        const match = text.match(emojiRegex);
        if (!match) {
          return [initSpec];
        }

        const firstNode = renderTextNode({
          textContent: text.substr(0, match.index ?? 0),
          id: {},
        });

        const imgNode = renderCustomElement({
          spec: $icon,
          attrs: new Map([
            ['style', 'display: inline-block;height: 2rem;'],
          ]),
          inputs: {
            icon: match[1],
          },
          id: {},
        });

        const lastNode = renderTextNode({
          textContent: text.substr(match.index ?? 0 + match[0].length),
          id: {},
        });

        return [firstNode, imgNode, lastNode];
      }),
  );
}
