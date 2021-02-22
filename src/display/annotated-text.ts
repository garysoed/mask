import {$asArray, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {attributeIn, host, listParser, multi, PersonaContext, RenderSpec, renderTextNode, root, stringParser, textIn} from 'persona';
import {combineLatest, concat, Observable, of as observableOf} from 'rxjs';
import {bufferCount, map, switchMap, withLatestFrom} from 'rxjs/operators';

import {_p} from '../app/app';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

import {$annotationConfig, AnnotationSpec} from './annotation-service';


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
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.content(this.content$),
    ];
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
      renderSpecs: readonly RenderSpec[],
      spec: AnnotationSpec,
  ): Observable<readonly RenderSpec[]> {
    return concat(...renderSpecs.map(renderSpec => spec(renderSpec))).pipe(
        bufferCount(renderSpecs.length),
        map(outputs => {
          return outputs.reduce((acc, curr) => [...acc, ...curr]);
        }),
    );
  }

  private applyAnnotations(
      spec: RenderSpec,
      specs: readonly AnnotationSpec[],
  ): Observable<readonly RenderSpec[]> {
    if (specs.length <= 0) {
      return observableOf([spec]);
    }

    let obs: Observable<readonly RenderSpec[]> = observableOf([spec]);
    for (const spec of specs) {
      obs = obs.pipe(switchMap(nodes => this.applyAnnotation(nodes, spec)));
    }

    return obs;
  }

  @cache()
  private get content$(): Observable<readonly RenderSpec[]> {
    return combineLatest([
      this.inputs.host.text,
      this.annotations$,
    ])
        .pipe(
            switchMap(([textContent, annotations]) => {
              return this.applyAnnotations(
                  renderTextNode({textContent, id: textContent}),
                  annotations,
              );
            }),
        );
  }
}
