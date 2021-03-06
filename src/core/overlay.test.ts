import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {PersonaTesterFactory, dispatchResizeEvent} from 'persona/export/testing';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {_p} from '../app/app';

import {$, $overlay, Overlay} from './overlay';
import {$overlayService, Anchor, OverlayService} from './overlay-service';
import * as snapshots from './snapshots.json';


const dest = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(event => dest.log(event));

const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@mask/core/overlay', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv(snapshots));

    const tester = TESTER_FACTORY.build([Overlay], document);
    const el = tester.createElement($overlay.tag);
    document.body.appendChild(el.element);
    const overlayService = new OverlayService();
    $overlayService.set(tester.vine, () => overlayService);

    return {el, overlayService, tester};
  });

  test('contentRect$', _, init => {
    const _ = init(_ => {
      const targetEl = document.createElement('div');
      targetEl.style.position = 'fixed';
      targetEl.style.height = '20px';
      targetEl.style.width = '40px';
      targetEl.style.left = '10px';
      targetEl.style.top = '30px';
      document.body.appendChild(targetEl);

      const contentEl = document.createElement('div');
      return {..._, targetEl, contentEl};
    });

    function dispatchResize(): void {
      const contentEl = _.el.getElement($.content);
      dispatchResizeEvent(contentEl, [{contentRect: new DOMRect(0, 0, 80, 60)}]);
    }

    should('set the left and top correctly if content and target anchors are START - START', () => {
      _.overlayService.show({
        target: {node: _.targetEl, horizontal: Anchor.START, vertical: Anchor.START},
        content: {node: _.contentEl, horizontal: Anchor.START, vertical: Anchor.START},
      });

      dispatchResize();

      assert(_.el.getStyle($.content._.styleLeft)).to.equal('10px');
      assert(_.el.getStyle($.content._.styleTop)).to.equal('30px');
    });

    should('set the left and top correctly if content and target anchors are MIDDLE - MIDDLE', () => {
      _.overlayService.show({
        target: {node: _.targetEl, horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
        content: {node: _.contentEl, horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
      });

      dispatchResize();

      assert(_.el.getStyle($.content._.styleLeft)).to.equal('-10px');
      assert(_.el.getStyle($.content._.styleTop)).to.equal('10px');
    });

    should('set the left and top correctly if content and target anchors are END - END', () => {
      _.overlayService.show({
        target: {node: _.targetEl, horizontal: Anchor.END, vertical: Anchor.END},
        content: {node: _.contentEl, horizontal: Anchor.END, vertical: Anchor.END},
      });

      dispatchResize();

      assert(_.el.getStyle($.content._.styleLeft)).to.equal('-30px');
      assert(_.el.getStyle($.content._.styleTop)).to.equal('-10px');
    });
  });

  test('overlayContent$', () => {
    should('display the content el when shown', () => {
      const contentEl = document.createElement('div');
      contentEl.id = 'content';
      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: contentEl,
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      _.overlayService.show(event);

      assert(_.el.element.shadowRoot!.getElementById('content')!.innerHTML).to
          .matchSnapshot('overlay.content');
    });
  });

  test('showStatus', () => {
    should('display the overlay onShow', () => {
      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: document.createDocumentFragment(),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      _.overlayService.show(event);

      assert(_.el.hasClass($.root._.hidden)).to.equal(false);
    });

    should('hide the overlay on clicking root element', () => {
      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: document.createDocumentFragment(),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      _.overlayService.show(event);
      _.el.dispatchEvent($.root._.onClick);

      assert(_.el.hasClass($.root._.hidden)).to.equal(true);
    });

    should('not hide the overlay when clicking something other than the root element', () => {
      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: document.createDocumentFragment(),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      _.overlayService.show(event);
      _.el.element.shadowRoot!.getElementById('content')!.dispatchEvent(new CustomEvent('click'));

      assert(_.el.hasClass($.root._.hidden)).to.equal(false);
    });
  });
});
