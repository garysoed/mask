import {createObjectPath, ObjectPath} from 'gs-tools/export/state';
import {Converter, Result} from 'nabu';

export function objectPathParser<T>(): Converter<ObjectPath<T>, string> {
  return {
    convertBackward(id: string): Result<ObjectPath<T>> {
      if (!id) {
        return {success: false};
      }

      return {success: true, result: createObjectPath(id)};
    },

    convertForward({id}: ObjectPath<T>): Result<string> {
      return {success: true, result: id};
    },
  };
}
