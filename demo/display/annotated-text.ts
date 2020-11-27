import {cache} from 'gs-tools/export/data';
import {NodeWithId, PersonaContext, renderCustomElement, setId} from 'persona';
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
    $annotationConfig.set(vine, configs => new Map([
      ...configs,
      ['emoji', renderEmoji],
    ]));

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

function renderEmoji(
    initNode: NodeWithId<Node>,
    context: PersonaContext,
): Observable<ReadonlyArray<NodeWithId<Node>>> {
  if (!(initNode instanceof Text)) {
    return observableOf([initNode]);
  }

  const initText = initNode.textContent ?? '';
  const match = initText.match(emojiRegex);
  if (!match) {
    return observableOf([initNode]);
  }

  const splitNode = initNode.splitText(match.index ?? 0);
  const remainderNode = setId(splitNode.splitText(match[0].length), {});
  return renderCustomElement(
      $icon,
      {
        inputs: {icon: observableOf(match[1])},
        attrs: new Map([
          ['style', observableOf('display: inline-block;height: 2rem;')],
        ]),
      },
      {},
      context,
  )
      .pipe(map(imgNode => [initNode, imgNode, remainderNode]));
}
