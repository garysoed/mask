import {assert, should, test} from 'gs-testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../app/app';

import {$qIsDesktop, RootLayout} from './root-layout';


const testerFactory = new PersonaTesterFactory(_p);

test('layout.RootLayout', init => {
  const _ = init(() => {
    const tester = testerFactory.build({rootCtrls: [RootLayout], rootDoc: document});
    const {harness} = tester.createHarness(RootLayout);
    return {harness, tester};
  });

  test('handleDrawerExpandCollapse', () => {
    should('open the drawer if hovered', () => {
      _.harness.drawer._.onMouseEnter(new CustomEvent('mouseenter'));


      assert(_.harness.drawer._.expanded).to.emitWith(true);
      assert(_.harness.host._.drawerExpanded).to.emitWith(true);
    });

    should('collapse the drawer if not hovered and is not desktop', () => {
      _.harness.drawer._.onMouseEnter(new CustomEvent('mouseenter'));

      assert(_.harness.drawer._.expanded).to.emitWith(true);

      _.harness.drawer._.onMouseLeave(new CustomEvent('mouseleave'));

      assert(_.harness.drawer._.expanded).to.emitWith(false);
      assert(_.harness.host._.drawerExpanded).to.emitWith(false);
    });

    should('open the drawer if destop sized', () => {
      _.tester.setMedia($qIsDesktop, true);

      assert(_.harness.drawer._.expanded).to.emitWith(true);
      assert(_.harness.host._.drawerExpanded).to.emitWith(true);
    });
  });
});
