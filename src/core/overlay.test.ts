import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {ElementHarness, getHarness} from 'persona/export/testing';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {setupThemedTest} from '../testing/setup-themed-test';

import goldens from './goldens/goldens.json';
import {OVERLAY} from './overlay';
import {$overlayService, Anchor} from './overlay-service';


const dest = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(event => dest.log(event));

test('@mask/src/core/overlay', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/core/goldens', goldens));

    const tester = setupThemedTest({roots: [OVERLAY]});
    const element = tester.createElement(OVERLAY);
    document.body.appendChild(element);

    return {element, tester};
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
      const contentEl = getHarness(_.element, 'content', ElementHarness);
      contentEl.simulateResize(new DOMRect(0, 0, 80, 60));
    }

    should('set the left and top correctly if content and target anchors are START - START', () => {
      $overlayService.get(_.tester.vine).show({
        target: {node: _.targetEl, horizontal: Anchor.START, vertical: Anchor.START},
        content: {node: _.contentEl, horizontal: Anchor.START, vertical: Anchor.START},
      });

      dispatchResize();

      assert(_.element).to.matchSnapshot('overlay__start-start.html');
    });

    should('set the left and top correctly if content and target anchors are MIDDLE - MIDDLE', () => {
      $overlayService.get(_.tester.vine).show({
        target: {node: _.targetEl, horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
        content: {node: _.contentEl, horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
      });

      dispatchResize();

      assert(_.element).to.matchSnapshot('overlay__middle-middle.html');
    });

    should('set the left and top correctly if content and target anchors are END - END', () => {
      $overlayService.get(_.tester.vine).show({
        target: {node: _.targetEl, horizontal: Anchor.END, vertical: Anchor.END},
        content: {node: _.contentEl, horizontal: Anchor.END, vertical: Anchor.END},
      });

      dispatchResize();

      assert(_.element).to.matchSnapshot('overlay__end-end.html');
    });
  });

  test('overlayContent$', () => {
    should('display the content el when shown', () => {
      const contentEl = document.createElement('div');
      contentEl.id = 'testContent';
      contentEl.innerText = 'test content';
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
      $overlayService.get(_.tester.vine).show(event);

      assert(_.element).to.matchSnapshot('overlay__content.html');
    });
  });

  test('showStatus', () => {
    should('display the overlay onShow', () => {
      const content = document.createDocumentFragment();
      content.appendChild(document.createElement('div'));
      content.appendChild(document.createElement('span'));

      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: content,
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      $overlayService.get(_.tester.vine).show(event);

      assert(_.element).to.matchSnapshot('overlay__show.html');
    });

    should('hide the overlay on clicking root element', () => {
      const content = document.createDocumentFragment();
      content.appendChild(document.createElement('div'));
      content.appendChild(document.createElement('span'));

      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: content,
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      $overlayService.get(_.tester.vine).show(event);
      getHarness(_.element, 'root', ElementHarness).simulateClick();

      assert(_.element).to.matchSnapshot('overlay__click-root.html');
    });

    should('not hide the overlay when clicking the content element', () => {
      const content = document.createDocumentFragment();
      content.appendChild(document.createElement('div'));
      content.appendChild(document.createElement('span'));

      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: content,
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      $overlayService.get(_.tester.vine).show(event);
      getHarness(_.element, 'content', ElementHarness).simulateClick();

      assert(_.element).to.matchSnapshot('overlay__click-content.html');
    });
  });
});
