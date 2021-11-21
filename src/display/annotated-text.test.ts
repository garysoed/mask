import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {RenderSpecType} from 'persona';
import {flattenNode, PersonaTesterFactory} from 'persona/export/testing';
import {EMPTY, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {_p} from '../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import {AnnotatedText} from './annotated-text';
import {$annotationSpecs$} from './annotation-service';
import goldens from './goldens/goldens.json';


const TESTER_FACTORY = new PersonaTesterFactory(_p);

test('@mask/display/annotated-text', init => {
  setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/display/goldens', goldens));
  });

  const _ = init(() => {
    const tester = TESTER_FACTORY.build({
      rootCtrls: [AnnotatedText],
      rootDoc: document,
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    const {element, harness} = tester.createHarness(AnnotatedText);
    return {element, harness, tester};
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

      _.harness.host._.annotations(['atob', 'btoc']);
      _.harness.host._.text('banana');

      assert(flattenNode(_.element)).to.matchSnapshot('annotated-text');
    });
  });
});
