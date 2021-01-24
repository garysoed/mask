import {source, Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {Snapshot, StateId, StateService} from 'gs-tools/export/state';
import {EditableStorage} from 'gs-tools/export/store';
import {BehaviorSubject, combineLatest, EMPTY, merge, Observable, of as observableOf} from 'rxjs';
import {map, share, switchMap, take, tap} from 'rxjs/operators';

import {$stateService} from './state-service';


interface SaveConfig {
  readonly loadOnInit: boolean;
  readonly saveId: string;
  readonly storage: EditableStorage<Snapshot<any>>;
  initFn(stateService: StateService): StateId<any>;
}

export class SaveService {
  private readonly shouldSave$ = new BehaviorSubject(false);

  constructor(private readonly vine: Vine) { }

  @cache()
  private get handleInit$(): Observable<unknown> {
    return $saveConfig.get(this.vine).pipe(
        filterNonNullable(),
        take(1),
        switchMap(config => {
          const onLoaded$ = config.loadOnInit ? this.load() : observableOf(false);
          return onLoaded$.pipe(
              switchMap(isLoaded => {
                if (isLoaded) {
                  return EMPTY;
                }

                return $stateService.get(this.vine).pipe(
                    take(1),
                    tap(stateService => {
                      $rootId.set(this.vine, () => config.initFn(stateService));
                    }),
                );
              }),
          );
        }),
    );
  }

  @cache()
  private get handleOnSave$(): Observable<unknown> {
    return combineLatest([
      this.shouldSave$,
      $stateService.get(this.vine),
      $saveConfig.get(this.vine),
      $rootId.get(this.vine),
    ])
        .pipe(
            switchMap(([isSaving, stateService, saveConfig, rootId]) => {
              if (!isSaving || !saveConfig || !rootId) {
                return EMPTY;
              }

              return stateService.onChange$.pipe(
                  tap(() => {
                    const snapshot = stateService.snapshot(rootId);
                    if (!snapshot) {
                      saveConfig.storage.delete(saveConfig.saveId);
                      return;
                    }

                    const updated = saveConfig.storage.update(saveConfig.saveId, snapshot);
                    if (updated) {
                      return;
                    }
                  }),
              );
            }),
            share(),
        );
  }

  load(): Observable<boolean> {
    return combineLatest([this.savedState$, $stateService.get(this.vine)]).pipe(
        take(1),
        map(([state, stateService]) => {
          if (state) {
            stateService.init(state);
            $rootId.set(this.vine, () => state.rootId);
            return true;
          }

          return false;
        }),
    );
  }

  run(): Observable<unknown> {
    return merge(this.handleOnSave$, this.handleInit$);
  }

  get savedState$(): Observable<Snapshot<unknown>|undefined> {
    return $saveConfig.get(this.vine).pipe(
        switchMap(config => {
          if (!config) {
            return EMPTY;
          }
          return config.storage.read(config.saveId);
        }),
    );
  }

  setSaving(isSaving: boolean): void {
    this.shouldSave$.next(isSaving);
  }
}

export const $rootId = source<StateId<any>|undefined>('rootId', () => undefined);
export const $saveConfig = source<SaveConfig|undefined>('saveConfig', () => undefined);
export const $saveService = source('SaveService', vine => new SaveService(vine));
