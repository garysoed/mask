import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {PersonaTesterFactory} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';

import {_p} from '../app/app';

import {$, $annotatedText, AnnotatedText} from './annotated-text';
import {$annotationConfig} from './annotation-service';
import * as snapshots from './snapshots.json';


const TESTER_FACTORY = new PersonaTesterFactory(_p);

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
              node => {
                node.textContent = node.textContent!.replace(/a/g, 'b');
                return observableOf([node]);
              },
            ],
            [
              'btoc',
              node => {
                node.textContent = node.textContent!.replace(/b/g, 'c');
                return observableOf([node]);
              },
            ],
          ]),
      );

      _.el.setAttribute($.host._.annotations, ['atob', 'btoc']);
      _.el.setText($.host, 'banana');

      assert(_.el.element.shadowRoot?.innerHTML).to.matchSnapshot('annotatedText');
    });
  });
});
