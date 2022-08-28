import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {ElementHarness, getHarness} from 'persona/export/testing';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {setupThemedTest} from '../testing/setup-themed-test';

import goldens from './goldens/goldens.json';
import {OVERLAY} from './overlay';
import {$overlayService, Anchor} from './overlay-service';


const dest = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(event => dest.log(event));

test('@mask/src/core/overlay', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/core/goldens', goldens));

    const tester = setupThemedTest({roots: [OVERLAY]});
    const element = tester.bootstrapElement(OVERLAY);
    document.body.appendChild(element);

    return {element, tester};
  });

  test('contentRect$', () => {
    setup(_, () => {
      const targetEl = document.createElement('div');
      targetEl.style.position = 'fixed';
      targetEl.style.height = '20px';
      targetEl.style.width = '40px';
      targetEl.style.left = '10px';
      targetEl.style.top = '30px';
      document.body.appendChild(targetEl);

      const templateEl = document.createElement('template');
      const contentEl = document.createElement('div');
      templateEl.content.appendChild(contentEl);
      return {targetEl, templateEl};
    });

    function dispatchResize(): void {
      const contentEl = getHarness(_.element, '#content', ElementHarness);
      contentEl.simulateResize(new DOMRect(0, 0, 80, 60));
    }

    should('set the left and top correctly if content and target anchors are START - START', () => {
      $overlayService.get(_.tester.vine).show({
        target: {node: _.targetEl, horizontal: Anchor.START, vertical: Anchor.START},
        content: {node: _.templateEl, horizontal: Anchor.START, vertical: Anchor.START},
      });

      dispatchResize();

      assert(_.element).to.matchSnapshot('overlay__start-start.html');
    });

    should('set the left and top correctly if content and target anchors are MIDDLE - MIDDLE', () => {
      $overlayService.get(_.tester.vine).show({
        target: {node: _.targetEl, horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
        content: {node: _.templateEl, horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
      });

      dispatchResize();

      assert(_.element).to.matchSnapshot('overlay__middle-middle.html');
    });

    should('set the left and top correctly if content and target anchors are END - END', () => {
      $overlayService.get(_.tester.vine).show({
        target: {node: _.targetEl, horizontal: Anchor.END, vertical: Anchor.END},
        content: {node: _.templateEl, horizontal: Anchor.END, vertical: Anchor.END},
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
      const templateEl = document.createElement('template');
      templateEl.content.appendChild(contentEl);
      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: templateEl,
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

      const templateEl = document.createElement('template');
      templateEl.content.appendChild(content);

      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: templateEl,
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

      const templateEl = document.createElement('template');
      templateEl.content.appendChild(content);
      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: templateEl,
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      $overlayService.get(_.tester.vine).show(event);
      getHarness(_.element, '#root', ElementHarness).simulateClick();

      assert(_.element).to.matchSnapshot('overlay__click-root.html');
    });

    should('not hide the overlay when clicking the content element', () => {
      const content = document.createDocumentFragment();
      content.appendChild(document.createElement('div'));
      content.appendChild(document.createElement('span'));

      const templateEl = document.createElement('template');
      templateEl.content.appendChild(content);
      const event = {
        target: {
          node: document.createElement('div'),
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        content: {
          node: templateEl,
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      $overlayService.get(_.tester.vine).show(event);
      getHarness(_.element, '#content', ElementHarness).simulateClick();

      assert(_.element).to.matchSnapshot('overlay__click-content.html');
    });
  });
});
