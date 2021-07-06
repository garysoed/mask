import {createMutablePath, MutablePath} from 'gs-tools/export/state';
import {Converter, Result} from 'nabu';

export function mutablePathParser<T>(): Converter<MutablePath<T>, string> {
  return {
    convertBackward(id: string): Result<MutablePath<T>> {
      if (!id) {
        return {success: false};
      }

      return {success: true, result: createMutablePath(id)};
    },

    convertForward({id}: MutablePath<T>): Result<string> {
      return {success: true, result: id};
    },
  };
}
