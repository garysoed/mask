import { staticSourceId, staticStreamId } from 'grapevine/export/component';
import { Errors } from 'gs-tools/export/error';
import { BooleanType, EqualType, HasPropertiesType, InstanceofType, UnionType } from 'gs-types/export';
import { BehaviorSubject, Observable } from 'rxjs';
import { _v } from '../app/app';

export interface OpenState {
  cancelable: boolean;
  isOpen: true;
  closeFn(canceled: boolean): void;
  elementProvider(): HTMLElement;
}

interface CloseState {
  isOpen: false;
}

export type DialogState = OpenState|CloseState;

interface DialogSpec {
  cancelable: boolean;
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
    });
  }
}
export const $dialogService = staticSourceId('dialogService', InstanceofType(DialogService));
_v.builder.source($dialogService, new DialogService());

export const $dialogState = staticStreamId(
    'dialogSource',
    UnionType<DialogState>([
      HasPropertiesType<CloseState>({isOpen: EqualType<false>(false)}),
      HasPropertiesType<OpenState>({
        cancelable: BooleanType,
        closeFn: InstanceofType<(value: unknown) => void>(Function),
        elementProvider: InstanceofType<() => HTMLElement>(Function),
        isOpen: EqualType<true>(true),
      }),
    ]),
);
_v.builder.stream(
    $dialogState,
    (dialogService: DialogService) => dialogService.getStateObs(),
    $dialogService,
);
