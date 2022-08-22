import {Vine} from 'grapevine';
import {assert, createSpySubject, should, test, setup} from 'gs-testing';

import {$svgService, registerSvg} from './svg-service';


test('@mask/src/core/svg-service', () => {
  const _ = setup(() => {
    const vine = new Vine({appName: 'test'});
    return {vine};
  });

  should('emit the SVG string once', () => {
    const key = 'key';
    const svg$ = createSpySubject($svgService.get(_.vine).getSvg(key));

    const svg = '<svg></svg>';

    registerSvg(_.vine, key, {type: 'embed', content: svg});

    // register other SVG.
    registerSvg(_.vine, 'other', {type: 'embed', content: svg});

    assert(svg$).to.emitSequence([null, svg]);
  });
});