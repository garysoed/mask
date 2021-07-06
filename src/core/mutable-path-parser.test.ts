import {assert, objectThat, should, test} from 'gs-testing';
import {createMutablePath, MutablePath} from 'gs-tools/export/state';

import {mutablePathParser} from './mutable-path-parser';


test('@mask/core/mutable-path-parser', init => {
  const _ = init(() => {
    const parser = mutablePathParser<number>();
    return {parser};
  });

  test('convertBackward', () => {
    should('use the string as the inner ID', () => {
      const id = 'id';
      assert(_.parser.convertBackward(id)).to.haveProperties({
        success: true,
        result: objectThat<MutablePath<number>>().haveProperties({id}),
      });
    });

    should('fail if the id is empty string', () => {
      assert(_.parser.convertBackward('')).to.haveProperties({
        success: false,
      });
    });
  });

  test('convertForward', () => {
    should('return the inner ID', () => {
      const id = 'id';
      assert(_.parser.convertForward(createMutablePath(id))).to.haveProperties({
        success: true,
        result: id,
      });
    });
  });
});
