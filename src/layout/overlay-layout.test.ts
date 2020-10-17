import { anyThat, assert, createSpySubject, objectThat, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { switchMap } from 'rxjs/operators';

import { _p } from '../app/app';
import { $overlayService, Anchor, NodeSpec, ShowEvent } from '../core/overlay-service';

import { $, $overlayLayout, OverlayLayout } from './overlay-layout';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@mask/layout/overlay-layout', init => {
  const _ = init(() => {
    const tester = TESTER_FACTORY.build([OverlayLayout], document);
    const el = tester.createElement($overlayLayout.tag);
    document.body.appendChild(el.element);
    return {el, tester};
  });

  test('handleOnShow$', () => {
    should(`show the content with the correct options`, () => {
      const targetEl = document.createElement('div');
      const targetId = 'targetId';
      targetEl.id = targetId;
      document.body.appendChild(targetEl);
      run(_.el.setAttribute($.host._.targetId, targetId));

      const targetHorizontal = Anchor.START;
      run(_.el.setAttribute($.host._.targetHorizontal, targetHorizontal));
      const targetVertical = Anchor.END;
      run(_.el.setAttribute($.host._.targetVertical, targetVertical));

      const contentNode = document.createElement('div');
      run(_.el.addSlotElement($.slot, contentNode));
      const contentHorizontal = Anchor.MIDDLE;
      run(_.el.setAttribute($.host._.contentHorizontal, contentHorizontal));
      const contentVertical = Anchor.END;
      run(_.el.setAttribute($.host._.contentVertical, contentVertical));

      const showEvent$ = createSpySubject($overlayService.get(_.tester.vine).pipe(
          switchMap(service => service.onShow$),
      ));
      run(_.el.callFunction($.host._.showFn, []));

      assert(showEvent$).to.emitWith(objectThat<ShowEvent>().haveProperties({
        target: objectThat<NodeSpec<Element>>().haveProperties({
          node: targetEl,
          horizontal: targetHorizontal,
          vertical: targetVertical,
        }),
        content: objectThat<NodeSpec<Node>>().haveProperties({
          node: anyThat<Node>().passPredicate(
              node => node.childNodes[0] === contentNode,
              'match content node',
          ),
          horizontal: contentHorizontal,
          vertical: contentVertical,
        }),
      }));
    });
  });
});
