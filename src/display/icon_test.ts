import { VineImpl } from 'grapevine/export/main';
import { assert, should } from 'gs-testing/export/main';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { $, icon } from './icon';
import { $defaultIconFont } from './registered-font';

const DEFAULT_ICON_CLASS = 'defaultIconClass';
const DEFAULT_ICON_FONT = 'defaultIconFont';
const DEFAULT_FONT_URL = new URL('http://defaultFontUrl');

const ICON_CLASS = 'iconClass';
const ICON_FONT = 'iconFont';
const FONT_URL = new URL('http://fontUrl');

const {configure, tag} = icon(
  '',
  ImmutableMap.of([
    [DEFAULT_ICON_FONT, {iconClass: DEFAULT_ICON_CLASS, url: DEFAULT_FONT_URL}],
    [ICON_FONT, {iconClass: ICON_CLASS, url: FONT_URL}],
  ]));
const configureIcon = configure;
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

describe('display.Icon', () => {
  let el: HTMLElement;
  let vine: VineImpl;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([tag]);
    vine = tester.vine;
    configureIcon(vine);

    el = tester.createElement('mk-icon', document.body);
  });

  describe('providesFontConfig_', () => {
    should(`use the specified font config`, async () => {
      await tester.setAttribute(el, $.host.iconFamily, ICON_FONT);

      assert(tester.getProperty(el, $.link.el, 'href')).to.equal(FONT_URL.toString());
    });

    should(`use the default font config if the specified font doesn't exist`, async () => {
      await tester.setAttribute(el, $.host.iconFamily, 'nonexistent');
      vine.setValue($defaultIconFont, DEFAULT_ICON_FONT);
      assert(tester.getProperty(el, $.link.el, 'href')).to.equal(DEFAULT_FONT_URL.toString());
    });

    should(`return null if the default icon font has no config`, async () => {
      await tester.setAttribute(el, $.host.iconFamily, 'nonexistent');
      assert(tester.getProperty(el, $.link.el, 'href')).to.equal(window.location.href);
    });
  });

  describe('renderLinkHref_', () => {
    should(`render the correct HREF`, async () => {
      await tester.setAttribute(el, $.host.iconFamily, ICON_FONT);
      assert(tester.getProperty(el, $.link.el, 'href')).to.equal(FONT_URL.toString());
    });

    should(`render empty string if there are no font configs`, async () => {
      await tester.setAttribute(el, $.host.iconFamily, 'nonexistent');
      assert(tester.getProperty(el, $.link.el, 'href')).to.equal(window.location.href);
    });
  });

  describe('renderRootClassList_', () => {
    should(`render the correct icon class`, async () => {
      await tester.setAttribute(el, $.host.iconFamily, ICON_FONT);
      assert(tester.getProperty(el, $.root.el, 'classList').contains(ICON_CLASS)).to.beTrue();
    });

    should(`render empty class if there are no font configs`, async () => {
      await tester.setAttribute(el, $.host.iconFamily, 'nonexistent');
      assert(tester.getProperty(el, $.root.el, 'classList').length).to.equal(0);
    });
  });

  describe('onRun', () => {
    should(`create the correct link elements`, () => {
      // tslint:disable-next-line:no-non-null-assertion
      assert((document.head!.querySelector(`link#mkIconFamily_${DEFAULT_ICON_FONT}`) as
            HTMLLinkElement).href).to.equal(DEFAULT_FONT_URL.toString());

      // tslint:disable-next-line:no-non-null-assertion
      assert((document.head!.querySelector(`link#mkIconFamily_${ICON_FONT}`) as
            HTMLLinkElement).href).to.equal(FONT_URL.toString());
    });
  });
});
