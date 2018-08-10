import { match, retryUntil, should } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { persona_, vineApp_ } from '../app/app';
import { ActionEvent } from '../event/action-event';
import { simulateKeypress } from '../testing/util';
import { TextButton } from './text-button';

describe('component.TextButton', () => {
  let el: HTMLElement;

  beforeAll(() => {
    persona_.builder.register([TextButton], vineApp_.builder);
    persona_.builder.build(window.customElements, vineApp_.builder.run(), 'open');
  });

  beforeEach(() => {
    el = document.createElement('mk-text-button');
    document.body.appendChild(el);
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

  describe('renderLabel_', () => {
    should(`render the label correctly`, async () => {
      const newLabel = 'newLabel';
      el.setAttribute('label', newLabel);

      await retryUntil(() => {
        // tslint:disable-next-line:no-non-null-assertion
        return (el.shadowRoot!.querySelector('#root')! as HTMLElement).textContent;
      }).to.equal(newLabel);
    });
  });

  describe('renderHostAriaLabel_', () => {
    should(`render the aria label if given`, async () => {
      const newLabel = 'newLabel';
      el.setAttribute('aria-label', newLabel);

      await retryUntil(() => {
        return el.getAttribute('aria-label');
      }).to.equal(newLabel);
    });

    should(`render the label if aria-label is not given`, async () => {
      const newLabel = 'newLabel';
      el.setAttribute('label', newLabel);

      await retryUntil(() => {
        return el.getAttribute('aria-label');
      }).to.equal(newLabel);
    });
  });
});
