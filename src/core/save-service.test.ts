import {$stateService, Vine} from 'grapevine';
import {assert, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {InMemoryStorage} from 'gs-tools/export/store';
import {Subject} from 'rxjs';

import {$saveConfig, SaveService} from './save-service';


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

    const storage = new InMemoryStorage<TestState>();
    const service = new SaveService(vine);
    run(service.run());
    const onSave$ = new Subject();
    $saveConfig.get(vine).next({
      onSave$,
      storage,
    });

    return {onSave$, service, stateService, storage, vine};
  });

  test('handleOnStorageChange$', () => {
    should('initialize the state service with an existing save', () => {
      const saveId = 'saveId';
      const rootId = _.service.declareSaveable(saveId, x => x.add({a: 0, s: ''}));
      _.storage.update(saveId, {a: 123, s: 'abc'});

      assert(_.stateService.resolve(rootId)).to.emitWith(
          objectThat<TestState>().haveProperties({a: 123, s: 'abc'}),
      );
    });
  });

  test('handleOnStateChange$', () => {
    should('update the storage on state change', () => {
      const saveId = 'saveId';
      const rootId = _.service.declareSaveable(saveId, x => x.add({a: 0, s: ''}));

      _.stateService.modify(x => x.set(rootId, {a: 345, s: 'cde'}));
      _.onSave$.next();

      const state$ = _.storage.read(saveId);
      assert(state$).to.emitWith(objectThat<TestState>().haveProperties({a: 345, s: 'cde'}));
    });
  });
});
