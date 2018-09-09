import { fshould, match, retryUntil, should } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { ImmutableMap } from 'gs-tools/export/collect';
import { PersonaTesterFactory } from 'persona/export/testing';
import { persona_, vine_ } from '../app/app';
import { icon } from '../display/icon';
import { ActionEvent } from '../event/action-event';
import { simulateKeypress } from '../testing/util';
import { iconButton } from './icon-button';

const ICON_CLASS = 'iconClass';
const ICON_FONT = 'iconFont';
const FONT_URL = new URL('http://fontUrl');

const iconConfig = icon(
    '',
    ImmutableMap.of([
      [ICON_FONT, {iconClass: ICON_CLASS, url: FONT_URL}],
    ]));
const {ctor} = iconButton(iconConfig);
// tslint:disable-next-line:no-non-null-assertion
const testerFactory = new PersonaTesterFactory(vine_.builder, persona_.builder);

describe('component.IconButton', () => {
  let el: HTMLElement;

  beforeEach(() => {
    const tester = testerFactory.build([ctor]);
    el = tester.createElement('mk-icon-button', document.body);
  });

  describe('constructor', () => {
    should(`set the default attributes correctly`, async () => {
      await retryUntil(() => el.getAttribute('aria-disabled')).to.equal('false');
      await retryUntil(() => el.getAttribute('aria-label')).to.equal('');
    });
  });

  describe('activate_', () => {
    should(`fire the action event if clicked`, async () => {
      const mockListener = createSpy('Listener');

      el.addEventListener('mk-action', mockListener);
      await retryUntil(() => {
        el.click();

        return mockListener;
      }).to.equal(
          match.anySpyThat().haveBeenCalledWith(match.anyThat().beAnInstanceOf(ActionEvent)));
    });

    should(`fire the action event on pressing Enter`, async () => {
      const mockListener = createSpy('Listener');

      el.addEventListener('mk-action', mockListener);
      await retryUntil(() => {
        simulateKeypress([{key: 'Enter'}], el);

        return mockListener;
      }).to.equal(
          match.anySpyThat().haveBeenCalledWith(match.anyThat().beAnInstanceOf(ActionEvent)));
    });

    should(`fire the action event on pressing space`, async () => {
      const mockListener = createSpy('Listener');

      el.addEventListener('mk-action', mockListener);
      await retryUntil(() => {
        simulateKeypress([{key: ' '}], el);

        return mockListener;
      }).to.equal(
          match.anySpyThat().haveBeenCalledWith(match.anyThat().beAnInstanceOf(ActionEvent)));
    });

    should(`not fire the action event if disabled`, async () => {
      const mockListener = createSpy('Listener');

      el.setAttribute('disabled', 'true');
      el.addEventListener('mk-action', mockListener);
      await retryUntil(() => {
        el.click();

        return mockListener;
      }).toNot.equal(match.anySpyThat().haveBeenCalled());
    });
  });

  describe('renderHostAriaLabel_', () => {
    should(`render the aria label correctly`, async () => {
      const newLabel = 'newLabel';
      el.setAttribute('aria-label', newLabel);

      await retryUntil(() => {
        return el.getAttribute('aria-label');
      }).to.equal(newLabel);
    });
  });

  describe('renderIconFamily_', () => {
    should(`render the icon family correctly`, async () => {
      const iconFamily = 'iconFamily';
      el.setAttribute('icon-family', iconFamily);

      await retryUntil(() => {
        // tslint:disable-next-line:no-non-null-assertion
        return el.shadowRoot!.querySelector('#icon')!.getAttribute('icon-family');
      }).to.equal(iconFamily);
    });
  });

  describe('renderRole_', () => {
    should(`render the correct role`, async () => {
      await retryUntil(() => {
        return el.getAttribute('role');
      }).to.equal('button');
    });
  });

  describe('renderTabIndex_', () => {
    should(`render 0 if host is not disabled`, async () => {
      el.setAttribute('disabled', 'false');
      await retryUntil(() => {
        return el.getAttribute('tabindex');
      }).to.equal('0');
    });

    should(`return -1 if host is disabled`, async () => {
      el.setAttribute('disabled', 'true');
      await retryUntil(() => {
        return el.getAttribute('tabindex');
      }).to.equal('-1');
    });
  });
});
