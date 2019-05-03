import { Errors } from '@gs-tools/error';
import { BehaviorSubject, Observable } from '@rxjs';
import { switchMap } from '@rxjs/operators';
import { _v } from '../app/app';

interface CloseState {
  isOpen: false;
}

export type DialogState = OpenState|CloseState;

interface DialogSpec {
  cancelable: boolean;
  contentAttr?: Map<string, string>;
  contentTag: string;
  title: string;
  onClose(canceled: boolean): void;
}

export interface OpenState {
  isOpen: true;
  spec: DialogSpec;
  closeFn(canceled: boolean): void;
}

export class DialogService {
  private readonly stateObs: BehaviorSubject<DialogState> =
      new BehaviorSubject<DialogState>({isOpen: false});

  getStateObs(): Observable<DialogState> {
    return this.stateObs;
  }

  open(spec: DialogSpec): void {
    const latestState = this.stateObs.getValue();
    if (latestState.isOpen) {
      throw Errors.assert('State of dialog service').shouldBe('closed').butWas('opened');
    }

    this.stateObs.next({
      closeFn: (canceled: boolean) => {
        this.close();

        spec.onClose(canceled);
      },
      isOpen: true,
      spec: {...spec},
    });
  }

  private close(): void {
    this.stateObs.next({isOpen: false});
  }
}
export const $dialogService = _v.source(() => new BehaviorSubject(new DialogService()), globalThis);

export const $dialogState = _v.stream(
    vine => $dialogService
        .get(vine)
        .pipe(switchMap(dialogService => dialogService.getStateObs())),
    globalThis,
);
