import {$stateService, source, Vine} from 'grapevine';
import {$asArray, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {Modifier, StateId} from 'gs-tools/export/state';
import {EditableStorage} from 'gs-tools/export/store';
import {BehaviorSubject, combineLatest, EMPTY, merge, Observable, ReplaySubject} from 'rxjs';
import {map, scan, share, switchMap, tap, withLatestFrom} from 'rxjs/operators';


interface SaveConfig {
  readonly onSave$: Observable<unknown>;
  readonly storage: EditableStorage<any>;
}

interface Saveable {
  readonly storageId: string;
  readonly stateId: StateId<unknown>;
}


export class SaveService {
  private readonly saveable$ = new ReplaySubject<Saveable>();

  constructor(private readonly vine: Vine) { }

  declareSaveable<T>(storageId: string, initFn: (modifier: Modifier) => StateId<T>): StateId<T> {
    const stateService = $stateService.get(this.vine);
    const stateId = stateService.modify(initFn);
    this.saveable$.next({storageId, stateId});
    return stateId;
  }

  @cache()
  private get handleOnStorageChange$(): Observable<unknown> {
    const stateService = $stateService.get(this.vine);
    return combineLatest([this.saveables$, $saveConfig.get(this.vine)])
        .pipe(
            switchMap(([saveables, config]) => {
              if (!config) {
                return EMPTY;
              }

              const onStorageChange = $pipe(
                  saveables,
                  $map(saveable => config.storage.read(saveable.storageId).pipe(
                      stateService.modifyOperator((x, item) => x.set(saveable.stateId, item)),
                  )),
                  $asArray(),
              );

              if (onStorageChange.length <= 0) {
                return EMPTY;
              }

              return merge(...onStorageChange);
            }),
        );
  }

  @cache()
  private get handleOnStateChange$(): Observable<unknown> {
    const stateService = $stateService.get(this.vine);
    return combineLatest([
      $saveConfig.get(this.vine),
      this.saveables$,
    ])
        .pipe(
            switchMap(([config, saveables]) => {
              if (!config) {
                return EMPTY;
              }

              const states = $pipe(
                  saveables,
                  $map(saveable => stateService.resolve(saveable.stateId).pipe(
                      map(item => ({item, storageId: saveable.storageId})),
                  )),
                  $asArray(),
              );

              const states$ = combineLatest(states);
              return config.onSave$.pipe(
                  withLatestFrom(states$),
                  tap(([, states]) => {
                    for (const {item, storageId} of states) {
                      config.storage.update(storageId, item);
                    }
                  }),
              );
            }),
            share(),
        );
  }

  @cache()
  private get saveables$(): Observable<readonly Saveable[]> {
    return this.saveable$.pipe(
        scan((acc, item) => [...acc, item], [] as readonly Saveable[]),
    );
  }

  run(): Observable<unknown> {
    return merge(this.handleOnStateChange$, this.handleOnStorageChange$);
  }
}

export const $saveConfig = source<BehaviorSubject<SaveConfig|undefined>>(
    'saveConfig',
    () => new BehaviorSubject<SaveConfig|undefined>(undefined),
);
export const $saveService = source('SaveService', vine => new SaveService(vine));
