import {subjectSource} from 'grapevine';
import {RenderSpec} from 'persona';
import {Observable} from 'rxjs';

export type AnnotationSpec = (node: RenderSpec) => Observable<readonly RenderSpec[]>;

export type AnnotationConfig = ReadonlyMap<string, AnnotationSpec>;

export const $annotationConfig = subjectSource<AnnotationConfig>(
    'annotationConfig',
    () => new Map<string, AnnotationSpec>(),
);
