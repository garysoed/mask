import { assert, setup, should, test } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { NumberType } from 'gs-types/export';
import { BehaviorSubject } from 'rxjs';
import { DialogService, DialogState, OpenState } from './dialog-service';

test('section.DialogService', () => {
  let service: DialogService;

  setup(() => {
    service = new DialogService();
  });

  test('open', () => {
    should(`update the state correctly`, () => {
      const mockCloseHandler = createSpy<number>('CloseHandler');

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      service.getStateObs().subscribe(stateSubject);

      const resultSubject = new BehaviorSubject<number|null>(null);
      service.open({
        closeHandler: mockCloseHandler,
        elementProvider: () => document.createElement('div'),
        type: NumberType,
      }).subscribe(resultSubject);

      const newState = stateSubject.getValue() as OpenState<number>;
      assert(newState.isOpen).to.beTrue();

      // Close the dialog.
      const value = 123;
      newState.closeFn(value);
      assert(resultSubject.getValue()).to.equal(value);
      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });

    should(`error if the type given to the close function is wrong`, () => {
      const mockCloseHandler = createSpy<number>('CloseHandler');

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      service.getStateObs().subscribe(stateSubject);

      const resultSubject = new BehaviorSubject<number|null>(null);
      service.open({
        closeHandler: mockCloseHandler,
        elementProvider: () => document.createElement('div'),
        type: NumberType,
      }).subscribe(resultSubject);

      const newState = stateSubject.getValue() as OpenState<unknown>;
      // Close the dialog.
      assert(() => {
        newState.closeFn('abc');
      }).to.throwErrorWithMessage(/Type of/);
    });

    should(`throw error if already opening a dialog`, () => {
      const mockCloseHandler = createSpy<number>('CloseHandler');

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      service.getStateObs().subscribe(stateSubject);

      const spec = {
        closeHandler: mockCloseHandler,
        elementProvider: () => document.createElement('div'),
        type: NumberType,
      };
      service.open(spec);

      // Open the dialog again.
      assert(() => {
        service.open(spec);
      }).to.throwErrorWithMessage(/State of dialog service/);
    });
  });
});
