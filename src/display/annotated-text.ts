import {cache} from 'gs-tools/export/data';
import {arrayOfType, instanceofType, Type} from 'gs-types';
import {Context, Ctrl, itext, ivalue, ocase, oforeach, registerCustomElement, RenderSpec, renderTextNode, root} from 'persona';
import {combineLatest, concat, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {bufferCount, map, switchMap} from 'rxjs/operators';

import {ThemeLoader} from '../theme/loader/theme-loader';
import {renderTheme} from '../theme/render-theme';

import template from './annotated-text.html';


export type AnnotationSpec = (node: RenderSpec) => Observable<readonly RenderSpec[]>;
const ANNOTATION_SPEC_TYPE: Type<AnnotationSpec> = instanceofType(Function);

const $annotatedText = {
  host: {
    annotations: ivalue('annotations', arrayOfType(ANNOTATION_SPEC_TYPE), () => []),
    text: itext(),
  },
  shadow: {
    root: root({
      content: oforeach<RenderSpec>('#contents'),
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
              switchMap(([textContent, annotations]) => {
                return this.applyAnnotations(
                    renderTextNode({textContent: of(textContent ?? '')}),
                    annotations,
                );
              }),
              this.$.shadow.root.content(map(spec => spec)),
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
