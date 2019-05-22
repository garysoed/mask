import { ImmutableList } from '@gs-tools/collect';
import { integerConverter, listConverter, typeBased } from '@gs-tools/serializer';
import { Enums } from '@gs-tools/typescript';
import { BooleanType } from '@gs-types';
import { compose, Converter, human, identity, Result, Serializable } from '@nabu';

export function booleanParser(): Converter<boolean, string> {
  return compose(typeBased(BooleanType), human());
}

export function enumParser<E extends string>(enumSet: any): Converter<string, E> {
  const values = new Set(Enums.getAllValues(enumSet));

  return {
    convertBackward(value: E): Result<string> {
      return {success: true, result: value};
    },

    convertForward(value: string): Result<E> {
      if (values.has(value)) {
        return {success: true, result: value as E};
      }

      return {success: false};
    },
  };
}

export function integerParser(): Converter<number, string> {
  return compose(integerConverter(), human());
}

export function listParser<T>(
    itemParser: Converter<T, Serializable>,
): Converter<ImmutableList<T>, string> {
  return compose(
      listConverter(itemParser),
      human(),
  );
}

export function stringParser(): Converter<string, string> {
  return identity<string>();
}
