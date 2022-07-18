import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {RenderSpecType} from 'persona';
import {triggerFakeMutation} from 'persona/src/testing/fake-mutation-observer';
import {EMPTY, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {setupThemedTest} from '../testing/setup-themed-test';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import {ANNOTATED_TEXT, AnnotationSpec} from './annotated-text';
import goldens from './goldens/goldens.json';


test('@mask/src/display/annotated-text', init => {
  setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/display/goldens', goldens));
  });

  const _ = init(() => {
    const tester = setupThemedTest({
      roots: [ANNOTATED_TEXT],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    return {tester};
  });

  test('setupRenderText', () => {
    should('apply the annotations in order', () => {
      // Register the annotation specs.
      const atob: AnnotationSpec = spec => {
        if (spec.type !== RenderSpecType.TEXT_NODE) {
          return EMPTY;
        }
        return spec.textContent.pipe(
            map(text => [{
              ...spec,
              textContent: of(text.replace(/a/g, 'b')),
            }]),
        );
      };

      const btoc: AnnotationSpec = spec => {
        if (spec.type !== RenderSpecType.TEXT_NODE) {
          return EMPTY;
        }
        return spec.textContent.pipe(
            map(text => [{
              ...spec,
              textContent: of(text.replace(/b/g, 'c')),
            }]),
        );
      };

      const element = _.tester.bootstrapElement(ANNOTATED_TEXT);
      element.annotations = [atob, btoc];
      element.textContent = 'banana';
      triggerFakeMutation(element, {});

      assert(element).to.matchSnapshot('annotated-text.html');
    });
  });
});
