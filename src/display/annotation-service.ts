import {source} from 'grapevine';
import {RenderSpec} from 'persona';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {scan} from 'rxjs/operators';

export type AnnotationSpec = (node: RenderSpec) => Observable<readonly RenderSpec[]>;

export type AnnotationConfig = ReadonlyMap<string, AnnotationSpec>;

export const $annotationSpecs$ = source<Subject<[string, AnnotationSpec]>>(
    'annotationSpec$',
    () => new ReplaySubject<[string, AnnotationSpec]>(),
);
export const $annotationConfig = source<Observable<AnnotationConfig>>(
    'annotationConfig',
    vine => $annotationSpecs$.get(vine).pipe(
        scan((configMap, spec) => {
          return new Map([...configMap, spec]);
        }, new Map()),
    ),
);
