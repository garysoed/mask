import {assert, objectThat, should, test} from 'gs-testing';
import {createObjectPath, ObjectPath} from 'gs-tools/export/state';

import {objectPathParser} from './object-path-parser';


test('@mask/core/object-path-parser', init => {
  const _ = init(() => {
    const parser = objectPathParser<number>();
    return {parser};
  });

  test('convertBackward', () => {
    should('use the string as the inner ID', () => {
      const id = 'id';
      assert(_.parser.convertBackward(id)).to.haveProperties({
        success: true,
        result: objectThat<ObjectPath<number>>().haveProperties({id}),
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
      assert(_.parser.convertForward(createObjectPath(id))).to.haveProperties({
        success: true,
        result: id,
      });
    });
  });
});
