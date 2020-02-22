import { Source, Vine } from 'grapevine';
import { assert, createSpy, fake, setup, should, stringThat, test } from 'gs-testing';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { _v } from '../app/app';

import { DialogService, DialogState, OpenState } from './dialog-service';

test('@mask/section/dialog-service', () => {
  let source: Source<number|null, typeof globalThis>;
  let vine: Vine;
  let service: DialogService;

  setup(() => {
    source = _v.source(() => new BehaviorSubject<number|null>(null), globalThis);
    vine = _v.build('test');
    service = new DialogService(vine);
  });

  test('open', () => {
    should(`update the state correctly`, () => {
      const mockCloseHandler = createSpy<Observable<unknown>, [boolean, number|null]>(
          'CloseHandler',
      );
      fake(mockCloseHandler).always().return(EMPTY);

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      service.getStateObs().subscribe(stateSubject);

      service
          .open({
            cancelable: true,
            content: {tag: 'div'},
            source,
            title: 'title',
          })
          .pipe(switchMap(({canceled, value}) => mockCloseHandler(canceled, value)))
          .subscribe();

      const newState = stateSubject.getValue() as OpenState;
      assert(newState.isOpen).to.beTrue();

      const value = 123;
      source.get(vine).next(value);

      // Close the dialog.
      newState.closeFn(true).subscribe();
      assert(mockCloseHandler).to.haveBeenCalledWith(true, value);
      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });

    should(`throw error if already opening a dialog`, () => {
      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      service.getStateObs().subscribe(stateSubject);

      const spec = {
        cancelable: true,
        content: {tag: 'div'},
        title: 'title',
      };
      service.open(spec).subscribe();

      // Open the dialog again.
      const mockError = createSpy('error');
      service.open(spec).subscribe({error: err => mockError(err.message)});
      assert(mockError).to
          .haveBeenCalledWith(stringThat().match(/State of dialog service/));
    });
  });
});
