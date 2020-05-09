import { assert, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { of as observableOf } from 'rxjs';

import { _p } from '../app/app';

import { $, $$, AnnotatedText } from './annotated-text';
import { addAnnotationSpec } from './annotation-service';
import { newBuilder } from './annotation-spec';


const TESTER_FACTORY = new PersonaTesterFactory(_p);

test('@mask/display/annotated-text', init => {
  const _ = init(() => {
    const tester = TESTER_FACTORY.build([AnnotatedText], document);
    const el = tester.createElement($$.tag);
    return {el, tester};
  });

  test('setupRenderText', () => {
    should(`apply the annotations in order`, () => {
      // Register the annotation specs.
      addAnnotationSpec(
        _.tester.vine,
        'atob',
        newBuilder(_.tester.vine)
            .withRegexp(/a/)
            .render(node => {
              node.textContent = 'b';
              return observableOf([node]);
            }),
      );

      addAnnotationSpec(
          _.tester.vine,
          'btoc',
          newBuilder(_.tester.vine)
              .withRegexp(/b/)
              .render(node => {
                node.textContent = 'c';
                return observableOf([node]);
              }),
      );

      run(_.el.setAttribute($.host._.annotations, ['atob', 'btoc']));
      run(_.el.setAttribute($.host._.text, 'banana'));

      assert(_.el.getTextContent($.host)).to.emitWith('ccncnc');
    });
  });
});
