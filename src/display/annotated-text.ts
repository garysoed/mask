import {$asArray, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {debug} from 'gs-tools/export/rxjs';
import {attributeIn, host, listParser, multi, NodeWithId, PersonaContext, root, setId, stringParser, textIn, ValuesOf} from 'persona';
import {combineLatest, concat, Observable, of as observableOf} from 'rxjs';
import {bufferCount, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {_p} from '../app/app';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

import {$annotationConfig, AnnotationSpec} from './annotation-service';


const LOGGER = new Logger('mask.AnnotatedText');

export const $annotatedText = {
  tag: 'mk-annotated-text',
  api: {
    annotations: attributeIn('annotations', listParser(stringParser()), []),
    text: textIn(),
  },
};

export const $ = {
  host: host($annotatedText.api),
  root: root({
    content: multi('#contents'),
  }),
};

@_p.customElement({
  ...$annotatedText,
  template: '<!-- #contents -->',
})
export class AnnotatedText extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get values(): ValuesOf<typeof $> {
    return {
      root: {
        content: this.content$,
      },
    };
  }

  @cache()
  private get annotations$(): Observable<readonly AnnotationSpec[]> {
    return this.inputs.host.annotations.pipe(
        map(annotations => annotations || []),
        withLatestFrom($annotationConfig.get(this.vine)),
        map(([annotationIds, config]) => $pipe(
            annotationIds,
            $map(annotationId => config.get(annotationId) ?? null),
            $filterNonNull(),
            $asArray(),
        )),
    );
  }

  private applyAnnotation(
      nodes: ReadonlyArray<NodeWithId<Node>>,
      spec: AnnotationSpec,
  ): Observable<ReadonlyArray<NodeWithId<Node>>> {
    return concat(...nodes.map(node => spec(node, this.context))).pipe(
        bufferCount(nodes.length),
        map(outputs => {
          return outputs.reduce((acc, curr) => [...acc, ...curr]);
        }),
    );
  }

  private applyAnnotations(
      node: Node,
      specs: readonly AnnotationSpec[],
  ): Observable<ReadonlyArray<NodeWithId<Node>>> {
    if (specs.length <= 0) {
      return observableOf([setId(node, node)]);
    }

    let obs: Observable<ReadonlyArray<NodeWithId<Node>>> = observableOf([setId(node, node)]);
    for (const spec of specs) {
      obs = obs.pipe(switchMap(nodes => this.applyAnnotation(nodes, spec)));
    }

    return obs;
  }

  @cache()
  private get content$(): Observable<ReadonlyArray<NodeWithId<Node>>> {
    return combineLatest([
      this.inputs.host.text,
      this.annotations$,
    ])
        .pipe(
            switchMap(([text, annotations]) => {
              return this.applyAnnotations(document.createTextNode(text), annotations);
            }),
            debug(LOGGER, 'content'),
        );
  }
}
