import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {DIV, ParseType, renderElement, renderString, renderTemplate} from 'persona';
import {ElementHarness, getHarness} from 'persona/export/testing';
import {of} from 'rxjs';
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

      return {targetEl};
    });

    function dispatchResize(): void {
      const contentEl = getHarness(_.element, '#content', ElementHarness);
      contentEl.simulateResize(new DOMRect(0, 0, 80, 60));
    }

    should('set the left and top correctly if content and target anchors are START - START', () => {
      $overlayService.get(_.tester.vine).show({
        contentRenderSpec: renderElement({registration: DIV, spec: {}}),
        contentAnchor: {horizontal: Anchor.START, vertical: Anchor.START},
        target: _.targetEl,
        targetAnchor: {horizontal: Anchor.START, vertical: Anchor.START},
      });

      dispatchResize();

      assert(snapshotElement(_.element)).to.match('overlay__start-start.golden');
    });

    should('set the left and top correctly if content and target anchors are MIDDLE - MIDDLE',
        () => {
          $overlayService.get(_.tester.vine).show({
            contentRenderSpec: renderElement({registration: DIV, spec: {}}),
            target: _.targetEl,
            targetAnchor: {horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
            contentAnchor: {horizontal: Anchor.MIDDLE, vertical: Anchor.MIDDLE},
          });

          dispatchResize();

          assert(snapshotElement(_.element)).to.match('overlay__middle-middle.golden');
        });

    should('set the left and top correctly if content and target anchors are END - END', () => {
      $overlayService.get(_.tester.vine).show({
        contentRenderSpec: renderElement({registration: DIV, spec: {}}),
        target: _.targetEl,
        contentAnchor: {horizontal: Anchor.END, vertical: Anchor.END},
        targetAnchor: {horizontal: Anchor.END, vertical: Anchor.END},
      });

      dispatchResize();

      assert(snapshotElement(_.element)).to.match('overlay__end-end.golden');
    });
  });

  test('overlayContent$', () => {
    should('display the content el when shown', () => {
      const event = {
        contentRenderSpec: renderString({
          raw: of('<div id="testContent">test content</div>'),
          parseType: ParseType.HTML,
          spec: {},
        }),
        contentAnchor: {
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        target: document.createElement('div'),
        targetAnchor: {
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      $overlayService.get(_.tester.vine).show(event);

      assert(snapshotElement(_.element)).to.match('overlay__content.golden');
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
        contentRenderSpec: renderTemplate({
          template$: of(templateEl),
          spec: {},
        }),
        contentAnchor: {
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        target: document.createElement('div'),
        targetAnchor: {
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      $overlayService.get(_.tester.vine).show(event);

      assert(snapshotElement(_.element)).to.match('overlay__show.golden');
    });

    should('hide the overlay on clicking root element', () => {
      const content = document.createDocumentFragment();
      content.appendChild(document.createElement('div'));
      content.appendChild(document.createElement('span'));

      const templateEl = document.createElement('template');
      templateEl.content.appendChild(content);
      const event = {
        contentRenderSpec: renderTemplate({
          template$: of(templateEl),
          spec: {},
        }),
        contentAnchor: {
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        target: document.createElement('div'),
        targetAnchor: {
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      $overlayService.get(_.tester.vine).show(event);
      getHarness(_.element, '#root', ElementHarness).simulateClick();

      assert(snapshotElement(_.element)).to.match('overlay__click-root.golden');
    });

    should('not hide the overlay when clicking the content element', () => {
      const content = document.createDocumentFragment();
      content.appendChild(document.createElement('div'));
      content.appendChild(document.createElement('span'));

      const templateEl = document.createElement('template');
      templateEl.content.appendChild(content);
      const event = {
        contentRenderSpec: renderTemplate({
          template$: of(templateEl),
          spec: {},
        }),
        contentAnchor: {
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
        target: document.createElement('div'),
        targetAnchor: {
          horizontal: Anchor.MIDDLE,
          vertical: Anchor.MIDDLE,
        },
      };
      $overlayService.get(_.tester.vine).show(event);
      getHarness(_.element, '#content', ElementHarness).simulateClick();

      assert(snapshotElement(_.element)).to.match('overlay__click-content.golden');
    });
  });
});
