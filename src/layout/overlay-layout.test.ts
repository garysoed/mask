import {anyThat, assert, createSpySubject, objectThat, should, test, setup} from 'gs-testing';
import {getHarness, SlotHarness} from 'persona/export/testing';

import {$overlayService, Anchor, NodeSpec, ShowEvent} from '../core/overlay-service';
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
      getHarness(element, '#slot', SlotHarness).simulateSlotChange(rootEl => {
        rootEl.appendChild(contentNode);
      });
      const contentHorizontal = Anchor.MIDDLE;
      element.setAttribute('content-horizontal', contentHorizontal);
      const contentVertical = Anchor.END;
      element.setAttribute('content-vertical', contentVertical);

      const showEvent$ = createSpySubject($overlayService.get(_.tester.vine).onShow$);
      element.showFn(undefined);

      assert(showEvent$).to.emitWith(objectThat<ShowEvent>().haveProperties({
        target: objectThat<NodeSpec<Element>>().haveProperties({
          node: targetEl,
          horizontal: targetHorizontal,
          vertical: targetVertical,
        }),
        content: objectThat<NodeSpec<Node>>().haveProperties({
          node: anyThat<Node>().passPredicate(
              node => (node.childNodes[0] as HTMLElement).id === 'content',
              'match content node',
          ),
          horizontal: contentHorizontal,
          vertical: contentVertical,
        }),
      }));
    });
  });
});