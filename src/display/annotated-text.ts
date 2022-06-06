import {cache} from 'gs-tools/export/data';
import {arrayOfType, instanceofType, stringType, tupleOfType, Type} from 'gs-types';
import {Context, Ctrl, itext, ivalue, ocase, oforeach, registerCustomElement, renderFragment, RenderSpec, renderTextNode, root} from 'persona';
import {combineLatest, concat, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {bufferCount, map, switchMap} from 'rxjs/operators';

import {ThemeLoader} from '../theme/loader/theme-loader';
import {renderTheme} from '../theme/render-theme';

import template from './annotated-text.html';


export type AnnotationSpec = (node: RenderSpec) => Observable<readonly RenderSpec[]>;
const ANNOTATION_SPEC_TYPE: Type<AnnotationSpec> = instanceofType(Function);

const $annotatedText = {
  host: {
    annotations: ivalue('annotations', arrayOfType(ANNOTATION_SPEC_TYPE), []),
    text: itext(),
  },
  shadow: {
    root: root({
      content: oforeach('#contents', tupleOfType<[string, readonly AnnotationSpec[]]>(
          [stringType, arrayOfType(ANNOTATION_SPEC_TYPE)],
      )),
      theme: ocase<ThemeLoader>('#theme'),
    }),
  },
};

class AnnotatedText implements Ctrl {
  constructor(private readonly $: Context<typeof $annotatedText>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$, this.$.shadow.root.theme),
      combineLatest([
        this.$.host.text,
        this.$.host.annotations,
      ])
          .pipe(
              map(v => [v]),
              this.$.shadow.root.content(
                  ([textContent, annotations]) => this.renderAnnotations(textContent, annotations),
              ),
          ),
    ];
  }


  private applyAnnotations(
      spec: RenderSpec,
      specs: readonly AnnotationSpec[],
  ): Observable<readonly RenderSpec[]> {
    let obs: Observable<readonly RenderSpec[]> = of([spec]);
    for (const spec of specs) {
      obs = obs.pipe(this.getOperator(spec));
    }

    return obs;
  }

  private renderAnnotations(textContent: string, annotations: readonly AnnotationSpec[]): Observable<RenderSpec> {
    return this.applyAnnotations(
        renderTextNode({textContent: of(textContent)}),
        annotations,
    )
        .pipe(map(children => renderFragment({nodes: children})));
  }

  private getOperator(spec: AnnotationSpec): OperatorFunction<readonly RenderSpec[], readonly RenderSpec[]> {
    return pipe(
        switchMap(renderSpecs => {
          return concat(...renderSpecs.map(renderSpec => spec(renderSpec))).pipe(
              bufferCount(renderSpecs.length),
          );
        }),
        map(outputs => outputs.reduce((acc, curr) => [...acc, ...curr])),
    );
  }
}

export const ANNOTATED_TEXT = registerCustomElement({
  ctrl: AnnotatedText,
  spec: $annotatedText,
  tag: 'mk-annotated-text',
  template,
});
