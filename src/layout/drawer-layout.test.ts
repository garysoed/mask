import {assert, should, test} from 'gs-testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../app/app';

import {DrawerLayout, DrawerMode} from './drawer-layout';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/layout/drawer-layout', init => {
  const _ = init(() => {
    const tester = testerFactory.build({rootCtrls: [DrawerLayout], rootDoc: document});
    const {harness} = tester.createHarness(DrawerLayout);

    return {harness};
  });

  test('styleHeight$', () => {
    should('render the max size if horizontal and expanded', () => {
      const size = '123px';
      _.harness.host._.mode(DrawerMode.HORIZONTAL);
      _.harness.host._.maxSize(size);
      _.harness.host._.expanded(true);

      assert(_.harness.root._.styleHeight).to.emitWith(size);
    });

    should('render the min size if horizontal and collapsed', () => {
      const size = '123px';
      _.harness.host._.mode(DrawerMode.HORIZONTAL);
      _.harness.host._.minSize(size);
      _.harness.host._.expanded(false);

      assert(_.harness.root._.styleHeight).to.emitWith(size);
    });

    should('render \'100%\' if vertical', () => {
      _.harness.host._.mode(DrawerMode.VERTICAL);
      _.harness.host._.minSize('123px');
      _.harness.host._.expanded(true);

      assert(_.harness.root._.styleHeight).to.emitWith('100%');
    });
  });

  test('styleWidth$', () => {
    should('render the max size if vertical and expanded', () => {
      const size = '123px';
      _.harness.host._.mode(DrawerMode.VERTICAL);
      _.harness.host._.maxSize(size);
      _.harness.host._.expanded(true);

      assert(_.harness.root._.styleWidth).to.emitWith(size);
    });

    should('render the min size if vertical and collapsed', () => {
      const size = '123px';
      _.harness.host._.mode(DrawerMode.VERTICAL);
      _.harness.host._.minSize(size);
      _.harness.host._.expanded(false);

      assert(_.harness.root._.styleWidth).to.emitWith(size);
    });

    should('render \'100%\' if horizontal', () => {
      _.harness.host._.mode(DrawerMode.HORIZONTAL);
      _.harness.host._.minSize('123px');
      _.harness.host._.expanded(true);

      assert(_.harness.root._.styleWidth).to.emitWith('100%');
    });
  });
});
