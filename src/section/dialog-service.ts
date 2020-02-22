import { Source, Vine } from 'grapevine';
import { Errors } from 'gs-tools/export/error';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { _v } from '../app/app';

interface CloseState {
  isOpen: false;
}

export type DialogState = OpenState|CloseState;

interface DialogSpec<T> {
  cancelable: boolean;
  content: {
    attr?: Map<string, string>;
    tag: string;
  };
  source?: Source<T|null, any>;
  title: string;
}

export interface OpenState {
  isOpen: true;
  spec: DialogSpec<any>;
  closeFn(canceled: boolean): Observable<unknown>;
}

export interface DialogResult<T> {
  canceled: boolean;
  value: T|null;
}

export class DialogService {
  private readonly stateObs = new BehaviorSubject<DialogState>({isOpen: false});

  constructor(private readonly vine: Vine) { }

  getStateObs(): Observable<DialogState> {
    return this.stateObs;
  }

  open<T>(spec: DialogSpec<T>): Observable<DialogResult<T>> {
    return this.stateObs
        .pipe(
            take(1),
            switchMap(latestState => {
              if (latestState.isOpen) {
                throw Errors.assert('State of dialog service').shouldBe('closed').butWas('opened');
              }

              const source = spec.source;
              const sourceSubject = source ?
                  source.get(this.vine) :
                  new BehaviorSubject<T|null>(null);
              sourceSubject.next(null);

              const onCloseSubject = new Subject<DialogResult<T>>();

              this.stateObs.next({
                closeFn: (canceled: boolean) => {
                  return sourceSubject.pipe(
                      take(1),
                      tap(value => {
                        onCloseSubject.next({canceled, value});
                        this.close();
                      }),
                  );
                },
                isOpen: true,
                spec: {...spec},
              });

              return onCloseSubject;
            }),
        );
  }

  private close(): void {
    this.stateObs.next({isOpen: false});
  }
}
export const $dialogService = _v.source(
    vine => new BehaviorSubject(new DialogService(vine)),
    globalThis,
);

export const $dialogState = _v.stream(
    vine => $dialogService
        .get(vine)
        .pipe(switchMap(dialogService => dialogService.getStateObs())),
    globalThis,
);
