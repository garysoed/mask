import {StateId, createId} from 'gs-tools/export/state';
import {Converter, Result} from 'nabu';

export function stateIdParser<T>(): Converter<StateId<T>, string> {
  return {
    convertBackward(id: string): Result<StateId<T>> {
      return {success: true, result: createId(id)};
    },

    convertForward({id}: StateId<T>): Result<string> {
      return {success: true, result: id};
    },
  };
}
