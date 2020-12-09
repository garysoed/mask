import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {RenderTextNodeSpec} from 'persona';
import {PersonaTesterFactory} from 'persona/export/testing';
import {Observable, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {_p} from '../app/app';

import {$, $annotatedText, AnnotatedText} from './annotated-text';
import {$annotationConfig} from './annotation-service';
import * as snapshots from './snapshots.json';


const TESTER_FACTORY = new PersonaTesterFactory(_p);

function normalize<T>(value: T|Observable<T>): Observable<T> {
  return value instanceof Observable ? value : observableOf(value);
}

test('@mask/display/annotated-text', init => {
  setup(() => {
    runEnvironment(new BrowserSnapshotsEnv(snapshots));
  });

  const _ = init(() => {
    const tester = TESTER_FACTORY.build([AnnotatedText], document);
    const el = tester.createElement($annotatedText.tag);
    return {el, tester};
  });

  test('setupRenderText', () => {
    should('apply the annotations in order', () => {
      // Register the annotation specs.
      $annotationConfig.set(
          _.tester.vine,
          configs => new Map([
            ...configs,
            [
              'atob',
              spec => normalize((spec as RenderTextNodeSpec).text).pipe(
                  map(text => [{
                    ...spec,
                    text: text.replace(/a/g, 'b'),
                  }]),
              ),
            ],
            [
              'btoc',
              spec => normalize((spec as RenderTextNodeSpec).text).pipe(
                  map(text => [{
                    ...spec,
                    text: text.replace(/b/g, 'c'),
                  }]),
              ),
            ],
          ]),
      );

      _.el.setAttribute($.host._.annotations, ['atob', 'btoc']);
      _.el.setText($.host, 'banana');

      assert(_.el.getElement($.root)?.innerHTML).to.matchSnapshot('annotatedText');
    });
  });
});
