import { VineImpl } from 'grapevine/export/main';
import { match, retryUntil, should } from 'gs-testing/export/main';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { FakeCustomElementRegistry, PersonaTesterFactory } from 'persona/export/testing';
import { persona_, vine_ } from '../app/app';
import { icon } from './icon';
import { $defaultIconFont } from './registered-font';

const DEFAULT_ICON_CLASS = 'defaultIconClass';
const DEFAULT_ICON_FONT = 'defaultIconFont';
const DEFAULT_FONT_URL = new URL('http://defaultFontUrl');

const ICON_CLASS = 'iconClass';
const ICON_FONT = 'iconFont';
const FONT_URL = new URL('http://fontUrl');

const {configure, ctor} = icon(
  '',
  ImmutableMap.of([
    [DEFAULT_ICON_FONT, {iconClass: DEFAULT_ICON_CLASS, url: DEFAULT_FONT_URL}],
    [ICON_FONT, {iconClass: ICON_CLASS, url: FONT_URL}],
  ]));
const configureIcon = configure;
const testerFactory = new PersonaTesterFactory(vine_.builder, persona_.builder);

describe('display.Icon', () => {
  let el: HTMLElement;
  let vine: VineImpl;

  beforeEach(() => {
    const tester = testerFactory.build([ctor]);
    vine = tester.vine;
    configureIcon(vine);

    el = tester.createElement('mk-icon', document.body);
  });

  describe('providesFontConfig_', () => {
    should(`use the specified font config`, async () => {
      el.setAttribute('icon-family', ICON_FONT);
      await retryUntil(() => {
        // tslint:disable-next-line:no-non-null-assertion
        return (el.shadowRoot!.querySelector('#link') as HTMLLinkElement).href;
      }).to.equal(FONT_URL.toString());
    });

    should(`use the default font config if the specified font doesn't exist`, async () => {
      el.setAttribute('icon-family', 'nonexistent');
      vine.setValue($defaultIconFont, DEFAULT_ICON_FONT);
      await retryUntil(() => {
        // tslint:disable-next-line:no-non-null-assertion
        return (el.shadowRoot!.querySelector('#link') as HTMLLinkElement).href;
      }).to.equal(DEFAULT_FONT_URL.toString());
    });

    should(`return null if the default icon font has no config`, async () => {
      el.setAttribute('icon-family', 'nonexistent');
      await retryUntil(() => {
        // tslint:disable-next-line:no-non-null-assertion
        return (el.shadowRoot!.querySelector('#link') as HTMLLinkElement).href;
      }).to.equal(window.location.href);
    });
  });

  describe('renderLinkHref_', () => {
    should(`render the correct HREF`, async () => {
      el.setAttribute('icon-family', ICON_FONT);
      await retryUntil(() => {
        // tslint:disable-next-line:no-non-null-assertion
        return (el.shadowRoot!.querySelector('#link') as HTMLLinkElement).href;
      }).to.equal(FONT_URL.toString());
    });

    should(`render empty string if there are no font configs`, async () => {
      el.setAttribute('icon-family', 'nonexistent');
      await retryUntil(() => {
        // tslint:disable-next-line:no-non-null-assertion
        return (el.shadowRoot!.querySelector('#link') as HTMLLinkElement).href;
      }).to.equal(window.location.href);
    });
  });

  describe('renderRootClassList_', () => {
    should(`render the correct icon class`, async () => {
      el.setAttribute('icon-family', ICON_FONT);
      await retryUntil(() => {
        // tslint:disable-next-line:no-non-null-assertion
        return (el.shadowRoot!.querySelector('#root') as HTMLLinkElement).classList
            .contains(ICON_CLASS);
      }).to.equal(match.anyBooleanThat().beTrue());
    });

    should(`render empty class if there are no font configs`, async () => {
      el.setAttribute('icon-family', 'nonexistent');
      await retryUntil(() => {
        // tslint:disable-next-line:no-non-null-assertion
        return (el.shadowRoot!.querySelector('#root') as HTMLLinkElement).classList.length;
      }).to.equal(0);
    });
  });

  describe('onRun', () => {
    should(`create the correct link elements`, async () => {
      await retryUntil(() => {
        return (document.head.querySelector(`link#mkIconFamily_${DEFAULT_ICON_FONT}`) as
            HTMLLinkElement).href;
      }).to.equal(DEFAULT_FONT_URL.toString());

      await retryUntil(() => {
        return (document.head.querySelector(`link#mkIconFamily_${ICON_FONT}`) as
            HTMLLinkElement).href;
      }).to.equal(FONT_URL.toString());
    });
  });
});
