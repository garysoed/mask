import { source } from 'grapevine';
import { assert, createSpy, createSpySubject, fake, run, should, stringThat, test } from 'gs-testing';
import { EMPTY, Observable, of as observableOf } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { _v } from '../app/app';

import { DialogService, OpenState } from './dialog-service';


test('@mask/section/dialog-service', init => {
  const _ = init(() => {
    const src = source<number|null>(() => null);
    const vine = _v.build('test');
    const service = new DialogService(vine);
    return {src, vine, service};
  });

  test('open', () => {
    should(`update the state correctly`, () => {
      const mockCloseHandler = createSpy<Observable<unknown>, [boolean, number|null]>(
          'CloseHandler',
      );
      fake(mockCloseHandler).always().return(EMPTY);

      const state$ = createSpySubject(_.service.getStateObs());

      run(
          _.service
              .open({
                cancelable: true,
                content: {tag: 'div'},
                source: _.src,
                title: 'title',
              })
              .pipe(switchMap(({canceled, value}) => mockCloseHandler(canceled, value))),
          );

      assert(state$.pipe(map(({isOpen}) => isOpen))).to.emitWith(true);

      const value = 123;
      _.src.set(_.vine, () => value);

      // Close the dialog.
      run(
          state$.pipe(
              filter((state): state is OpenState => state.isOpen),
              switchMap(newState => {
                return newState.closeFn(true);
              }),
          ),
      );
      assert(mockCloseHandler).to.haveBeenCalledWith(true, value);
      // tslint:disable-next-line:no-non-null-assertion
      assert(state$.pipe(map(({isOpen}) => isOpen))).to.emitWith(false);
    });

    should(`throw error if already opening a dialog`, () => {
      const spec = {
        cancelable: true,
        content: {tag: 'div'},
        title: 'title',
      };
      run(_.service.open(spec));

      // Open the dialog again.
      const mockError = createSpy('error');
      run(
          _.service.open(spec)
              .pipe(
                  catchError(err => {
                    mockError(err.message);
                    return observableOf({});
                  }),
              ),
      );
      assert(mockError).to.haveBeenCalledWith(stringThat().match(/State of dialog service/));
    });
  });
});
