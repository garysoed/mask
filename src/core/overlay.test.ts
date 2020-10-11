import { assert, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { ON_LOG_$, WebConsoleDestination } from 'santa';

import { _p } from '../app/app';

import { $, $overlay, Overlay } from './overlay';
import { $overlayService, OverlayService } from './overlay-service';


const dest = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(event => dest.log(event));

const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@mask/core/overlay', init => {
  const _ = init(() => {
    const tester = TESTER_FACTORY.build([Overlay], document);
    const el = tester.createElement($overlay.tag);
    const overlayService = new OverlayService();
    $overlayService.set(tester.vine, () => overlayService);

    return {el, overlayService};
  });
  test('showStatus', () => {
    should(`display the overlay onShow`, () => {
      _.overlayService.show(document.createElement('div'), document.createDocumentFragment());

      assert(_.el.getHasClass($.root._.hidden)).to.emitWith(false);
    });

    should(`hide the overlay on clicking root element`, () => {
      _.overlayService.show(document.createElement('div'), document.createDocumentFragment());
      run(_.el.dispatchEvent($.root._.onClick));

      assert(_.el.getHasClass($.root._.hidden)).to.emitWith(true);
    });

    should(`not hide the overlay when clicking something other than the root element`, () => {
      _.overlayService.show(document.createElement('div'), document.createDocumentFragment());
      _.el.element.shadowRoot!.getElementById('content')!.dispatchEvent(new CustomEvent('click'));

      assert(_.el.getHasClass($.root._.hidden)).to.emitWith(false);
    });
  });
});
