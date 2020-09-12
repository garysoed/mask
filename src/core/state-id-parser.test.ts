import { assert, objectThat, run, should, test } from 'gs-testing';
import { StateId } from 'gs-tools/export/state';

import { stateIdParser } from './state-id-parser';

test('@mask/core/state-id-parser', init => {
  const _ = init(() => {
    const parser = stateIdParser<number>();
    return {parser};
  });

  test('convertBackward', () => {
    should(`use the string as the inner ID`, () => {
      const id = 'id';
      assert(_.parser.convertBackward(id)).to.haveProperties({
        success: true,
        result: objectThat<StateId<number>>().haveProperties({id}),
      });
    });
  });

  test('convertForward', () => {
    should(`return the inner ID`, () => {
      const id = 'id';
      assert(_.parser.convertForward({id})).to.haveProperties({
        success: true,
        result: id,
      });
    });
  });
});
