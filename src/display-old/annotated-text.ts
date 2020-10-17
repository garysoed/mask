import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { filterDefined } from 'gs-tools/export/rxjs';
import { attributeIn, host, listParser, PersonaContext, stringParser } from 'persona';
import { combineLatest, concat, Observable, of as observableOf } from 'rxjs';
import { bufferCount, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import { $annotationService } from './annotation-service';
import { AnnotationSpec } from './annotation-spec';


export const $$ = {
  tag: 'mk-annotated-text',
  api: {
    annotations: attributeIn('annotations', listParser(stringParser()), []),
    text: attributeIn('text', stringParser(), ''),
  },
};

export const $ = {
  host: host($$.api),
};

@_p.customElement({
  ...$$,
  template: '<slot></slot>',
})
export class AnnotatedText extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupRenderText());
  }

  @cache()
  private get annotations$(): Observable<readonly AnnotationSpec[]> {
    return this.declareInput($.host._.annotations).pipe(
        map(annotations => annotations || []),
        withLatestFrom($annotationService.get(this.vine)),
        map(([annotationIds, service]) => $pipe(
            annotationIds,
            $map(annotationId => service.getSpec(annotationId)),
            $filterNonNull(),
            $asArray(),
        )),
    );
  }

  private setupRenderText(): Observable<unknown> {
    return combineLatest([
      this.declareInput($.host._.text).pipe(filterDefined()),
      this.annotations$,
    ])
    .pipe(
        switchMap(([text, annotations]) => {
          const hostEl = $.host.getElement(this.context);
          return applyAnnotations(document.createTextNode(text), annotations).pipe(
              map(nodes => ({nodes, hostEl})),
          );
        }),
        tap(({nodes, hostEl}) => {
          const fragment = document.createDocumentFragment();
          for (const node of nodes) {
            fragment.appendChild(node);
          }

          hostEl.innerHTML = '';
          hostEl.appendChild(fragment);
        }),
    );
  }
}

function applyAnnotations(
    node: Node,
    specs: readonly AnnotationSpec[],
): Observable<readonly Node[]> {
  if (specs.length <= 0) {
    return observableOf([node]);
  }

  let obs: Observable<readonly Node[]> = observableOf([node]);
  for (const spec of specs) {
    obs = obs.pipe(switchMap(nodes => applyAnnotation(nodes, spec)));
  }

  return obs;
}

function applyAnnotation(
    nodes: readonly Node[],
    spec: AnnotationSpec,
): Observable<readonly Node[]> {
  return concat(...nodes.map(node => spec(node))).pipe(
      bufferCount(nodes.length),
      map(outputs => {
        return outputs.reduce((acc, curr) => [...acc, ...curr]);
      }),
  );
}
