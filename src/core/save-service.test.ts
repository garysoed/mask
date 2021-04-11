import {Vine} from 'grapevine';
import {arrayThat, assert, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, Snapshot, StateId} from 'gs-tools/export/state';
import {InMemoryStorage} from 'gs-tools/export/store';
import {map, take} from 'rxjs/operators';

import {$rootId$, $saveConfig, SaveService} from './save-service';
import {$stateService} from './state-service';


interface TestState {
  readonly a: number;
  readonly s: string;
}

test('@mask/core/save-service', init => {
  const _ = init(() => {
    const stateService = fakeStateService();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const service = new SaveService(vine);
    run(service.run());

    return {service, stateService, vine};
  });

  test('handleInit$', () => {
    should('initialize the state service with an existing save', () => {
      const saveId = 'saveId';
      const rootId = _.stateService.modify(x => x.add({a: 123, s: 'abc'}));
      const snapshot = _.stateService.snapshot(rootId)!;

      const storage = new InMemoryStorage<Snapshot<TestState>>();
      storage.update(saveId, snapshot);

      // Clear the state service, then set the storage.
      _.stateService.clear();
      $saveConfig.get(_.vine).next({
        loadOnInit: true,
        saveId,
        storage,
        initFn: stateService => stateService.modify(x => x.add({a: 0, s: ''})),
      });

      assert(_.stateService.resolve(rootId)).to.emitWith(
          objectThat<TestState>().haveProperties({a: 123, s: 'abc'}),
      );
      assert($rootId$.get(_.vine).pipe(map(stateId => stateId?.id))).to.emitWith(rootId.id);
    });

    should('not initialize the state service with an existing save if loadOnInit is false', () => {
      const saveId = 'saveId';
      const savedRootId = _.stateService.modify(x => x.add({a: 123, s: 'abc'}));
      const snapshot = _.stateService.snapshot(savedRootId)!;

      const storage = new InMemoryStorage<Snapshot<TestState>>();
      storage.update(saveId, snapshot);

      // Clear the state service, then set the storage.
      _.stateService.clear();
      let rootId: StateId<TestState>|null = null;
      $saveConfig.get(_.vine).next({
        loadOnInit: false,
        saveId,
        storage,
        initFn: stateService => {
          rootId = stateService.modify(x => x.add({a: 345, s: 'cde'}));
          return rootId;
        },
      });

      assert(_.stateService.resolve(rootId!)).to.emitWith(
          objectThat<TestState>().haveProperties({a: 345, s: 'cde'}),
      );
      assert($rootId$.get(_.vine).pipe(map(stateId => stateId?.id))).to.emitWith(rootId!.id);
    });

    should('initialize the state service with the init function if there are no existing states', () => {
      const saveId = 'saveId';
      const storage = new InMemoryStorage<Snapshot<TestState>>();

      // Clear the state service, then set the storage.
      _.stateService.clear();

      let rootId: StateId<TestState>|null = null;
      $saveConfig.get(_.vine).next({
        loadOnInit: true,
        saveId,
        storage,
        initFn: stateService => {
          rootId = stateService.modify(x => x.add({a: 123, s: 'abc'}));
          return rootId;
        },
      });

      assert(_.stateService.resolve(rootId!)).to.emitWith(
          objectThat<TestState>().haveProperties({a: 123, s: 'abc'}),
      );
      assert($rootId$.get(_.vine).pipe(map(stateId => stateId?.id))).to.emitWith(rootId!.id);
    });

    should('not initialize if the config is not set', () => {
      const saveId = 'saveId';
      const rootId = _.stateService.modify(x => x.add({a: 123, s: 'abc'}));
      const snapshot = _.stateService.snapshot(rootId)!;

      const storage = new InMemoryStorage<Snapshot<TestState>>();
      storage.update(saveId, snapshot);

      // Clear the state service, then set the storage.
      _.stateService.clear();

      assert(_.stateService.resolve(rootId)).to.emitWith(undefined);
      assert($rootId$.get(_.vine)).to.emitWith(undefined);
    });

    should('only initialize once', () => {
      const saveId = 'saveId';
      const rootId = _.stateService.modify(x => x.add({a: 123, s: 'abc'}));
      const snapshot = _.stateService.snapshot(rootId)!;

      const storage = new InMemoryStorage<Snapshot<TestState>>();
      storage.update(saveId, snapshot);

      // Clear the state service, then set the storage.
      _.stateService.clear();
      $saveConfig.get(_.vine).next({
        loadOnInit: true,
        saveId,
        storage,
        initFn: stateService => stateService.modify(x => x.add({a: 0, s: ''})),
      });

      // By this point, stateService should've been initialized.
      _.stateService.clear();
      $rootId$.get(_.vine).next(undefined);

      storage.update(saveId, snapshot);

      assert(_.stateService.resolve(rootId)).to.emitWith(undefined);
      assert($rootId$.get(_.vine)).to.emitWith(undefined);
    });
  });

  test('handleOnSave$', _, init => {
    const SAVE_ID = 'SAVE_ID';
    const _ = init(_ => {
      const storage = new InMemoryStorage<Snapshot<TestState>>();

      // Clear the state service, then set the storage.
      _.stateService.clear();
      $saveConfig.get(_.vine).next({
        loadOnInit: false,
        saveId: SAVE_ID,
        storage,
        initFn: stateService => stateService.modify(x => x.add({a: 123, s: 'abc'})),
      });

      return {..._, storage};
    });

    should('update the storage on state change', () => {
      _.service.setSaving(true);

      // Change the state
      run($rootId$.get(_.vine).pipe(
          take(1),
          _.stateService.modifyOperator((x, rootId) => x.set(rootId!, {a: 345, s: 'cde'})),
      ));

      const state$ = _.storage.read(SAVE_ID).pipe(
          map(snapshot => {
            return snapshot!.payloads
                .find(payload => {
                  return payload.id === snapshot!.rootId.id;
                });
          }),
          map(maybe => maybe!.obj),
      );
      assert(state$).to.emitWith(objectThat<TestState>().haveProperties({a: 345, s: 'cde'}));
    });

    should('not update if not saving', () => {
      _.service.setSaving(false);

      // Change the state
      run($rootId$.get(_.vine).pipe(
          take(1),
          _.stateService.modifyOperator((x, rootId) => x.set(rootId!, {a: 345, s: 'cde'})),
      ));

      assert(_.storage.read(SAVE_ID)).to.emitWith(undefined);
    });

    should('delete the entry if root ID is deleted', () => {
      _.service.setSaving(true);

      // Add another payload.
      _.stateService.modify(x => x.add(123));

      // Delete the root ID.
      run($rootId$.get(_.vine).pipe(
          take(1),
          _.stateService.modifyOperator((x, rootId) => x.delete(rootId!)),
      ));

      const save$ = _.storage.read(SAVE_ID);
      assert(save$).to.emitWith(undefined);
    });
  });

  test('savedState$', () => {
    should('emit with the saved state', () => {
      const saveId = 'saveId';
      const rootId = _.stateService.modify(x => x.add({a: 123, s: 'abc'}));
      const snapshot = _.stateService.snapshot(rootId)!;

      const storage = new InMemoryStorage<Snapshot<TestState>>();
      storage.update(saveId, snapshot);

      // Clear the state service, then set the storage.
      _.stateService.clear();
      $saveConfig.get(_.vine).next({
        loadOnInit: true,
        saveId,
        storage,
        initFn: stateService => stateService.modify(x => x.add({a: 0, s: ''})),
      });

      assert(_.service.savedState$).to.emitWith(
          objectThat<Snapshot<TestState>>().haveProperties({
            rootId: objectThat<StateId<TestState>>().haveProperties({id: rootId.id}),
            payloads: arrayThat<{id: string; obj: any}>().haveExactElements([
              objectThat<{id: string; obj: any}>().haveProperties({
                id: rootId.id,
                obj: objectThat<TestState>().haveProperties({a: 123, s: 'abc'}),
              }),
            ]),
          }),
      );
    });

    should('not emit if config is missing', () => {
      const saveId = 'saveId';
      const rootId = _.stateService.modify(x => x.add({a: 123, s: 'abc'}));
      const snapshot = _.stateService.snapshot(rootId)!;

      const storage = new InMemoryStorage<Snapshot<TestState>>();
      storage.update(saveId, snapshot);

      // Clear the state service, then set the storage.
      _.stateService.clear();

      assert(_.service.savedState$).to.emitSequence([]);
    });
  });
});
