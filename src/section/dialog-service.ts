import { staticSourceId, staticStreamId } from 'grapevine/export/component';
import { Errors } from 'gs-tools/export/error';
import { EqualType, HasPropertiesType, InstanceofType, Type, UnionType } from 'gs-types/export';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { _v } from '../app/app';

export interface OpenState<T> {
  isOpen: true;
  spec: DialogSpec<T>;
  closeFn(value: T): void;
}

interface CloseState {
  isOpen: false;
}

export type DialogState = OpenState<unknown>|CloseState;

interface DialogSpec<T> {
  type: Type<T>;
  cancelHandler?(): T;
  closeHandler(): T;
  elementProvider(): HTMLElement;
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

  open<T>(spec: DialogSpec<T>): Observable<T> {
    const latestState = this.stateObs_.getValue();
    if (latestState.isOpen) {
      throw Errors.assert('State of dialog service').shouldBe('closed').butWas('opened');
    }

    const resultSubject = new Subject<T>();
    this.stateObs_.next({
      closeFn: (value: unknown) => {
        if (!spec.type.check(value)) {
          throw Errors.assert(`Type of ${value}`).shouldBeA(spec.type).butWas(value);
        }
        this.close_();

        resultSubject.next(value);
      },
      isOpen: true,
      spec,
    });

    return resultSubject;
  }
}
export const $dialogService = staticSourceId('dialogService', InstanceofType(DialogService));
_v.builder.source($dialogService, new DialogService());

export const $dialogState = staticStreamId(
    'dialogSource',
    UnionType<DialogState>([
      HasPropertiesType<CloseState>({isOpen: EqualType<false>(false)}),
      HasPropertiesType<OpenState<unknown>>({
        closeFn: InstanceofType<(value: unknown) => void>(Function),
        isOpen: EqualType<true>(true),
        spec: InstanceofType<DialogSpec<unknown>>(Object),
      }),
    ]),
);
_v.builder.stream(
    $dialogState,
    (dialogService: DialogService) => dialogService.getStateObs(),
    $dialogService,
);
