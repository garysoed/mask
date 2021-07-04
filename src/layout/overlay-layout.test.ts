import {anyThat, assert, createSpySubject, objectThat, should, test} from 'gs-testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../app/app';
import {$overlayService, Anchor, NodeSpec, ShowEvent} from '../core/overlay-service';

import {OverlayLayout} from './overlay-layout';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@mask/layout/overlay-layout', init => {
  const _ = init(() => {
    const tester = TESTER_FACTORY.build({rootCtrls: [OverlayLayout], rootDoc: document});
    const {element, harness} = tester.createHarness(OverlayLayout);
    document.body.appendChild(element);
    return {element, harness, tester};
  });

  test('handleOnShow$', () => {
    should('show the content with the correct options', () => {
      const targetEl = document.createElement('div');
      const targetId = 'targetId';
      targetEl.id = targetId;
      document.body.appendChild(targetEl);
      _.harness.host._.targetId(targetId);

      const targetHorizontal = Anchor.START;
      _.harness.host._.targetHorizontal(targetHorizontal);
      const targetVertical = Anchor.END;
      _.harness.host._.targetVertical(targetVertical);

      const contentNode = document.createElement('div');
      contentNode.id = 'content';
      _.harness.slot._.slotted(contentNode);
      const contentHorizontal = Anchor.MIDDLE;
      _.harness.host._.contentHorizontal(contentHorizontal);
      const contentVertical = Anchor.END;
      _.harness.host._.contentVertical(contentVertical);

      const showEvent$ = createSpySubject($overlayService.get(_.tester.vine).onShow$);
      _.harness.host._.showFn([]);

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
