import { source } from 'grapevine';
import { NodeWithId, PersonaContext } from 'persona';
import { Observable } from 'rxjs';

export type AnnotationSpec = (
    node: NodeWithId<Node>,
    context: PersonaContext,
) => Observable<ReadonlyArray<NodeWithId<Node>>>;

export type AnnotationConfig = ReadonlyMap<string, AnnotationSpec>;

export const $annotationConfig = source<AnnotationConfig>(
    'annotationConfig',
    () => new Map<string, AnnotationSpec>(),
);
