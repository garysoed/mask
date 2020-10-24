import { source, stream, Vine } from 'grapevine';
import { map } from 'rxjs/operators';

import { AnnotationSpec } from '../display-old/annotation-spec';

export type AnnotationConfig = ReadonlyMap<string, AnnotationSpec>;

const $annotationConfig = source<AnnotationConfig>(
    'annotationConfig',
    () => new Map<string, AnnotationSpec>(),
);
