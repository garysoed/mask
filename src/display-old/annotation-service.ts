import { source, stream, Vine } from 'grapevine';
import { map } from 'rxjs/operators';

import { AnnotationSpec } from './annotation-spec';


class AnnotationService {
  constructor(private readonly annotations: ReadonlyMap<string, AnnotationSpec>) { }

  getSpec(annotationId: string): AnnotationSpec|null {
    return this.annotations.get(annotationId) || null;
  }
}

const $annotationConfig = source('annotationConfig', () => new Map<string, AnnotationSpec>());

export function addAnnotationSpec(vine: Vine, annotationId: string, spec: AnnotationSpec): void {
  $annotationConfig.set(vine, configMap => new Map([...configMap, [annotationId, spec]]));
}

export const $annotationService = stream(
    'AnnotationService',
    vine => $annotationConfig.get(vine)
        .pipe(map(config => new AnnotationService(config))),
);
