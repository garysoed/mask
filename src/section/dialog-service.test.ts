import { assert, createSpy, setup, should, test } from '@gs-testing';
import { BehaviorSubject } from '@rxjs';
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

      service.open({
        cancelable: true,
        content: {tag: 'div'},
        onClose: mockCloseHandler,
        title: 'title',
      });

      const newState = stateSubject.getValue() as OpenState;
      assert(newState.isOpen).to.beTrue();

      // Close the dialog.
      newState.closeFn(true);
      assert(mockCloseHandler).to.haveBeenCalledWith(true);
      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });

    should(`throw error if already opening a dialog`, () => {
      const mockCloseHandler = createSpy<number>('CloseHandler');

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      service.getStateObs().subscribe(stateSubject);

      const spec = {
        cancelable: true,
        content: {tag: 'div'},
        onClose: mockCloseHandler,
        title: 'title',
      };
      service.open(spec);

      // Open the dialog again.
      assert(() => {
        service.open(spec);
      }).to.throwErrorWithMessage(/State of dialog service/);
    });
  });
});
