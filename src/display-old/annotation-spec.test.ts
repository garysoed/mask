import { VineBuilder } from 'grapevine';
import { arrayThat, assert, createSpyInstance, fake, should, test } from 'gs-testing';
import { $innerHtmlParseService, InnerHtmlParseService } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

import { newBuilder } from './annotation-spec';


function testRenderFn(node: Node): Observable<readonly Node[]> {
  node.textContent = 'match';
  return observableOf([node]);
}

test('@mask/display/annotation-spec', init => {
  const _ = init(() => {
    const vine = new VineBuilder().build('test');
    const builder = newBuilder(vine);
    const mockInnerHtmlParseService = createSpyInstance(InnerHtmlParseService);
    $innerHtmlParseService.set(vine, () => mockInnerHtmlParseService);
    return {builder, mockInnerHtmlParseService};
  });

  test('Builder', () => {
    test('withRegexp', () => {
      should(`split up the nodes by regexp correctly`, () => {
        const node = document.createTextNode('at banana');
        const textContents$ = _.builder.withRegexp(/a/).render(testRenderFn)(node)
            .pipe(map(outputs => outputs.map(node => node.textContent)));

        assert(textContents$).to.emitWith(arrayThat<string>().haveExactElements([
          'match',
          't b',
          'match',
          'n',
          'match',
          'n',
          'match',
        ]));
      });

      should(`handle non matches at start and end of text`, () => {
        const node = document.createTextNode('eat');
        const textContents$ = _.builder.withRegexp(/a/).render(testRenderFn)(node)
            .pipe(map(outputs => outputs.map(node => node.textContent)));

        assert(textContents$).to.emitWith(arrayThat<string>().haveExactElements([
          'e',
          'match',
          't',
        ]));
      });

      should(`handle non matches`, () => {
        const node = document.createTextNode('text');
        const textContents$ = _.builder.withRegexp(/a/).render(testRenderFn)(node)
            .pipe(map(outputs => outputs.map(node => node.textContent)));

        assert(textContents$).to.emitWith(arrayThat<string>().haveExactElements(['text']));
      });

      should(`not match non text nodes`, () => {
        const el = document.createElement('div');
        const nodeTypes$ = _.builder.withRegexp(/a/).render(testRenderFn)(el)
            .pipe(map(outputs => outputs.map(node => node.nodeType)));

        assert(nodeTypes$).to.emitWith(arrayThat<number>().haveExactElements([Node.ELEMENT_NODE]));
      });
    });
  });

  test('Renderer', () => {
    test('renderSvg', () => {
      should(`insert SVGs in matching nodes`, () => {
        const matchNode = document.createTextNode('match');
        const unmatchNode1 = document.createTextNode('unmatch1');
        const unmatchNode2 = document.createTextNode('unmatch2');
        const matches = [
          {isMatch: false, node: unmatchNode1},
          {isMatch: true, node: matchNode},
          {isMatch: false, node: unmatchNode2},
        ];

        const content = 'content';
        const svgEl = document.createElement('svg');
        fake(_.mockInnerHtmlParseService.parse).always().return(observableOf(svgEl));

        const outputs$ = _.builder
            .withMatcher(() => matches)
            .renderSvg(content)(document.createTextNode('text'));

        assert(outputs$).to.emitWith(arrayThat<Node>().haveExactElements([
          unmatchNode1,
          svgEl,
          unmatchNode2,
        ]));
      });
    });
  });
});
