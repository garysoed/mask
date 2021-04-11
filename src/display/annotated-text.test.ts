import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {RenderSpecType} from 'persona';
import {PersonaTesterFactory} from 'persona/export/testing';
import {EMPTY, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {_p} from '../app/app';

import {$, AnnotatedText} from './annotated-text';
import {$annotationSpecs$} from './annotation-service';
import render from './goldens/annotated-text.html';


const TESTER_FACTORY = new PersonaTesterFactory(_p);

test('@mask/display/annotated-text', init => {
  setup(() => {
    runEnvironment(new BrowserSnapshotsEnv({render}));
  });

  const _ = init(() => {
    const tester = TESTER_FACTORY.build({rootCtrls: [AnnotatedText], rootDoc: document});
    const el = tester.createElement(AnnotatedText);
    return {el, tester};
  });

  test('setupRenderText', () => {
    should('apply the annotations in order', () => {
      // Register the annotation specs.
      $annotationSpecs$.get(_.tester.vine).next([
        'atob',
        spec => spec.type !== RenderSpecType.TEXT_NODE ? EMPTY : spec.textContent.pipe(
            map(text => [{
              ...spec,
              textContent: observableOf(text.replace(/a/g, 'b')),
            }]),
        ),
      ]);
      $annotationSpecs$.get(_.tester.vine).next([
        'btoc',
        spec => spec.type !== RenderSpecType.TEXT_NODE ? EMPTY : spec.textContent.pipe(
            map(text => [{
              ...spec,
              textContent: observableOf(text.replace(/b/g, 'c')),
            }]),
        ),
      ]);

      _.el.setAttribute($.host._.annotations, ['atob', 'btoc']);
      _.el.setText($.host, 'banana');

      assert(_.el.flattenContent()).to.matchSnapshot('render');
    });
  });
});
