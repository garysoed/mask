import { Vine } from 'grapevine';
import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { $innerHtmlParseService } from 'persona';
import { concat, Observable, of as observableOf } from 'rxjs';
import { bufferCount, map, switchMap, take } from 'rxjs/operators';


type AnnotationOutput = readonly Node[];

export type AnnotationSpec = (node: Node) => Observable<AnnotationOutput>;

interface MatchResult {
  readonly isMatch: boolean;
  readonly node: Node;
}

type MatchResults = ReadonlyArray<MatchResult>;

type MatchFn = (node: Node) => MatchResults;
type RenderFn = (node: Node) => Observable<readonly Node[]>;

class Renderer {
  constructor(
      private readonly matchFn: MatchFn,
      private readonly vine: Vine,
  ) { }

  render(renderFn: RenderFn): AnnotationSpec {
    return node => {
      const matches = this.matchFn(node);
      const nodesObs$List = $pipe(
          matches,
          $map(result => {
            if (!result.isMatch) {
              return observableOf<readonly Node[]>([result.node]);
            }

            return renderFn(result.node).pipe(take(1));
          }),
          $asArray(),
      );

      return concat(...nodesObs$List).pipe(
          bufferCount(nodesObs$List.length),
          map(outputs => {
            return outputs.reduce((acc, curr) => [...acc, ...curr]);
          }),
      );
    };
  }

  renderSvg(svgContent: string): AnnotationSpec {
    return this.render(node => {
      return $innerHtmlParseService.get(this.vine).pipe(
          switchMap(service => {
            return service.parse(svgContent, 'image/svg+xml')
                .pipe(map(parsedSvg => parsedSvg ? [parsedSvg] : [node]));
          }),
      );
    });
  }
}

class Builder {
  constructor(private readonly vine: Vine) { }

  withMatcher(match: MatchFn): Renderer {
    return new Renderer(match, this.vine);
  }

  withRegexp(regexp: RegExp): Renderer {
    const matchFn: MatchFn = node => {
      const nodes: MatchResult[] = [];
      let currNode = node;
      while (currNode instanceof Text) {
        const text = currNode.textContent || '';
        const match = text.match(regexp);
        if (!match || match.index === undefined) {
          if (text.length > 0) {
            nodes.push({isMatch: false, node: currNode.cloneNode(true)});
          }
          break;
        }

        const restNode = currNode.splitText(match.index);
        if (match.index > 0) {
          nodes.push({isMatch: false, node: currNode.cloneNode(true)});
        }

        const recurseNode = restNode.splitText(match[0].length);
        nodes.push({isMatch: true, node: restNode.cloneNode(true)});

        currNode = recurseNode;
      }

      if (!(currNode instanceof Text)) {
        nodes.push({isMatch: false, node: currNode.cloneNode(true)});
      }

      return nodes;
    };

    return this.withMatcher(matchFn);
  }
}

export function newBuilder(vine: Vine): Builder {
  return new Builder(vine);
}
