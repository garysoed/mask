import { source, Vine } from 'grapevine';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AnnotationSpec } from './annotation-spec';


class AnnotationService {
  constructor(private readonly vine: Vine) { }

  getSpec(annotationId: string): Observable<AnnotationSpec|null> {
    return $annotationConfig.get(this.vine).pipe(
        map(annotations => annotations.get(annotationId) || null),
    );
  }
}

const $annotationConfig = source('annotationConfig', () => new Map<string, AnnotationSpec>());

export function addAnnotationSpec(vine: Vine, annotationId: string, spec: AnnotationSpec): void {
  $annotationConfig.set(vine, configMap => new Map([...configMap, [annotationId, spec]]));
}

export const $annotationService = source(
    'AnnotationService',
    vine => new AnnotationService(vine),
);
