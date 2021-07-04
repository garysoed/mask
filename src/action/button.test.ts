import {anyThat, assert, createSpySubject, should, test} from 'gs-testing';
import {PersonaTesterFactory} from 'persona/export/testing';
import {fromEvent} from 'rxjs';

import {_p} from '../app/app';
import {ActionEvent} from '../event/action-event';

import {Button} from './button';


const testerFactory = new PersonaTesterFactory(_p);


test('@mask/action/button', init => {
  const _ = init(() => {
    const tester = testerFactory.build({rootCtrls: [Button], rootDoc: document});
    const {element, harness} = tester.createHarness(Button);

    return {element, harness, tester};
  });

  test('onAction$', _, init => {
    const _ = init(_ => {
      const actionSubject = createSpySubject(fromEvent(_.element, 'mk-action'));
      return {..._, actionSubject};
    });

    should('fire the action event if clicked', () => {
      _.harness.host._.onClick();
      assert(_.actionSubject).to.emitWith(
          anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent),
      );
    });

    should('fire the action event on pressing Enter', () => {
      _.harness.host._.onEnterDown();
      assert(_.actionSubject).to
          .emitWith(anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent));
    });

    should('fire the action event on pressing space', () => {
      _.harness.host._.onSpaceDown();
      assert(_.actionSubject).to
          .emitWith(anyThat<ActionEvent<unknown>>().beAnInstanceOf(ActionEvent));
    });

    should('not fire the action event if disabled', () => {
      _.harness.host._.disabled(true);

      _.harness.host._.onClick();
      assert(_.actionSubject).toNot.emit();
    });
  });

  test('renderTabIndex', () => {
    should('render 0 if host is not disabled', () => {
      _.harness.host._.disabled(false);
      assert(_.harness.host._.tabindex).to.emitWith(0);
    });

    should('return -1 if host is disabled', () => {
      _.harness.host._.disabled(true);
      assert(_.harness.host._.tabindex).to.emitWith(-1);
    });
  });
});
