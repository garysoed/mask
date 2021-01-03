import {source} from 'grapevine';
import {RenderCustomElementSpec, RenderElementSpec, RenderFragmentSpec, RenderHtmlSpec, RenderNodeSpec, RenderSpec, RenderTextNodeSpec} from 'persona';
import {UnresolvedSpec} from 'persona/src/main/api';
import {Observable} from 'rxjs';

interface NormalizedRenderCustomElementSpec<T extends UnresolvedSpec> extends RenderCustomElementSpec<T> {
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly textContent?: Observable<string>;
}

interface NormalizedRenderElementSpec extends RenderElementSpec {
  readonly attrs?: ReadonlyMap<string, Observable<string|undefined>>;
  readonly children?: Observable<readonly RenderSpec[]>;
  readonly textContent?: Observable<string>;
}

interface NormalizedRenderFragmentSpec extends RenderFragmentSpec { }

interface NormalizedRenderHtmlSpec extends RenderHtmlSpec { }

interface NormalizedRenderNodeSpec<N extends Node> extends RenderNodeSpec<N> { }

interface NormalizedRenderTextNodeSpec extends RenderTextNodeSpec {
  readonly textContent: Observable<string>;
}

export type NormalizedRenderSpec = NormalizedRenderCustomElementSpec<any>|
    NormalizedRenderElementSpec|
    NormalizedRenderFragmentSpec|
    NormalizedRenderHtmlSpec|
    NormalizedRenderNodeSpec<any>|
    NormalizedRenderTextNodeSpec;

export type AnnotationSpec = (node: NormalizedRenderSpec) => Observable<readonly RenderSpec[]>;

export type AnnotationConfig = ReadonlyMap<string, AnnotationSpec>;

export const $annotationConfig = source<AnnotationConfig>(
    'annotationConfig',
    () => new Map<string, AnnotationSpec>(),
);
