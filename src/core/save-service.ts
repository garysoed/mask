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
              tap(isLoaded => {
                if (isLoaded) {
                  return;
                }

                const stateService = $stateService.get(this.vine);
                $rootId$.get(this.vine).next(config.initFn(stateService));
              }),
          );
        }),
    );
  }

  @cache()
  private get handleOnSave$(): Observable<unknown> {
    const stateService = $stateService.get(this.vine);
    return combineLatest([
      this.shouldSave$,
      $saveConfig.get(this.vine),
      $rootId$.get(this.vine),
    ])
        .pipe(
            switchMap(([isSaving, saveConfig, rootId]) => {
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
    return this.savedState$.pipe(
        take(1),
        map(state => {
          if (state) {
            $stateService.get(this.vine).init(state);
            $rootId$.get(this.vine).next(state.rootId);
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

export const $rootId$ = source<BehaviorSubject<StateId<any>|undefined>>(
    'rootId',
    () => new BehaviorSubject<StateId<any>|undefined>(undefined),
);
export const $saveConfig = source<BehaviorSubject<SaveConfig|undefined>>(
    'saveConfig',
    () => new BehaviorSubject<SaveConfig|undefined>(undefined),
);
export const $saveService = source('SaveService', vine => new SaveService(vine));
