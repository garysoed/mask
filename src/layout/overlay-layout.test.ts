import {anyThat, assert, createSpySubject, objectThat, setup, should, test} from 'gs-testing';
import {RenderTemplateSpec} from 'persona';
import {getHarness, SlotHarness} from 'persona/export/testing';
import {switchMap} from 'rxjs/operators';

import {$overlayService, Anchor, AnchorSpec, ShowEvent} from '../core/overlay-service';
import {setupThemedTest} from '../testing/setup-themed-test';

import {OVERLAY_LAYOUT} from './overlay-layout';


test('@mask/src/layout/overlay-layout', () => {
  const _ = setup(() => {
    const tester = setupThemedTest({roots: [OVERLAY_LAYOUT]});
    return {tester};
  });

  test('handleOnShow$', () => {
    should('show the content with the correct options', () => {
      const element = _.tester.bootstrapElement(OVERLAY_LAYOUT);
      document.body.appendChild(element);

      const targetEl = document.createElement('div');
      document.body.appendChild(targetEl);
      element.target = targetEl;

      const targetHorizontal = Anchor.START;
      element.setAttribute('target-horizontal', targetHorizontal);
      const targetVertical = Anchor.END;
      element.setAttribute('target-vertical', targetVertical);

      const contentNode = document.createElement('div');
      contentNode.id = 'content';
      const templateEl = document.createElement('template');
      templateEl.content.appendChild(contentNode);
      getHarness(element, '#slot', SlotHarness).simulateSlotChange(rootEl => {
        rootEl.appendChild(templateEl);
      });
      const contentHorizontal = Anchor.MIDDLE;
      element.setAttribute('content-horizontal', contentHorizontal);
      const contentVertical = Anchor.END;
      element.setAttribute('content-vertical', contentVertical);

      const showEvent$ = createSpySubject($overlayService.get(_.tester.vine).onShow$);
      element.showFn(undefined);

      assert(showEvent$).to.emitWith(objectThat<ShowEvent>().haveProperties({
        target: targetEl,
        targetAnchor: objectThat<AnchorSpec>().haveProperties({
          horizontal: targetHorizontal,
          vertical: targetVertical,
        }),
        contentAnchor: objectThat<AnchorSpec>().haveProperties({
          horizontal: contentHorizontal,
          vertical: contentVertical,
        }),
      }));

      const templateSpec$ = showEvent$.pipe(
          switchMap(event => (event.contentRenderSpec as RenderTemplateSpec<any>).template$),
      );
      assert(templateSpec$).to.emitWith(
          anyThat<HTMLTemplateElement>().passPredicate(
              node => (node.content.childNodes[0] as HTMLElement).id === 'content',
              'match content node',
          ),
      );
    });
  });
});