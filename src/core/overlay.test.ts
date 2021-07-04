import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {dispatchResizeEvent, flattenNode, PersonaTesterFactory} from 'persona/export/testing';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {_p} from '../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import render from './goldens/overlay.txt';
import {Overlay} from './overlay';
import {$overlayService, Anchor, OverlayService} from './overlay-service';


const dest = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(event => dest.log(event));

const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@mask/core/overlay', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({render}));

    const overlayService = new OverlayService();
    const tester = TESTER_FACTORY.build({
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $overlayService, withValue: overlayService},
      ],
      rootCtrls: [Overlay],
      rootDoc: document,
    });
    const {element, harness} = tester.createHarness(Overlay);
    document.body.appendChild(element);

    return {element, harness, overlayService, tester};
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
      const contentEl = _.harness.content.selectable;
      dispatchResizeEvent(contentEl, [{contentRect: new DOMRect(0, 0, 80, 60)}]);
    }

    should('set the left and top correctly if content and target anchors are START - START', () => {
      _.overlayService.show({
        target: {node: _.targetEl, horizontal: Anchor.START, vertical: Anchor.START},
        content: {node: _.contentEl, horizontal: Anchor.START, vertical: Anchor.START},
      });

      dispatchResize();

      assert(_.harness.content._.styleLeft).to.emitWith('10px');
      assert(_.harness.content._.styleTop).to.emitWith('30px');
    });

    should('set the left and top correctly if content and target anchors are MIDDLE - MIDDLE', () => {
      _.overlayService.show({
        target: {node: _.targetEl, horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
        content: {node: _.contentEl, horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
      });

      dispatchResize();

      assert(_.harness.content._.styleLeft).to.emitWith('-10px');
      assert(_.harness.content._.styleTop).to.emitWith('10px');
    });

    should('set the left and top correctly if content and target anchors are END - END', () => {
      _.overlayService.show({
        target: {node: _.targetEl, horizontal: Anchor.END, vertical: Anchor.END},
        content: {node: _.contentEl, horizontal: Anchor.END, vertical: Anchor.END},
      });

      dispatchResize();

      assert(_.harness.content._.styleLeft).to.emitWith('-30px');
      assert(_.harness.content._.styleTop).to.emitWith('-10px');
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
      _.overlayService.show(event);

      assert(flattenNode(_.element)).to.matchSnapshot('render');
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

      assert(_.harness.root._.hidden).to.emitWith(false);
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
      _.harness.root._.onClick();

      assert(_.harness.root._.hidden).to.emitWith(true);
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
      _.element.shadowRoot!.getElementById('content')!.dispatchEvent(new CustomEvent('click'));

      assert(_.harness.root._.hidden).to.emitWith(false);
    });
  });
});
