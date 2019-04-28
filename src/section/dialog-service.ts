import { Errors } from '@gs-tools/error';
import { BehaviorSubject, Observable } from '@rxjs';
import { switchMap } from '@rxjs/operators';
import { _v } from '../app/app';

export interface OpenState {
  cancelable: boolean;
  isOpen: true;
  title: string;
  closeFn(canceled: boolean): void;
  elementProvider(): HTMLElement;
}

interface CloseState {
  isOpen: false;
}

export type DialogState = OpenState|CloseState;

interface DialogSpec {
  cancelable: boolean;
  title: string;
  elementProvider(): HTMLElement;
  onClose(canceled: boolean): void;
}

export class DialogService {
  private readonly stateObs_: BehaviorSubject<DialogState> =
      new BehaviorSubject<DialogState>({isOpen: false});

  private close_(): void {
    this.stateObs_.next({isOpen: false});
  }

  getStateObs(): Observable<DialogState> {
    return this.stateObs_;
  }

  open<T>(spec: DialogSpec): void {
    const latestState = this.stateObs_.getValue();
    if (latestState.isOpen) {
      throw Errors.assert('State of dialog service').shouldBe('closed').butWas('opened');
    }

    this.stateObs_.next({
      cancelable: spec.cancelable,
      closeFn: (canceled: boolean) => {
        this.close_();

        spec.onClose(canceled);
      },
      elementProvider: spec.elementProvider,
      isOpen: true,
      title: spec.title,
    });
  }
}
export const $dialogService = _v.source(() => new BehaviorSubject(new DialogService()), globalThis);

export const $dialogState = _v.stream(
    vine => $dialogService
        .get(vine)
        .pipe(switchMap(dialogService => dialogService.getStateObs())),
    globalThis,
);
