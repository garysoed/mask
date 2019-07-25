import { ImmutableList, ImmutableMap } from '@gs-tools/collect';
import { integerConverter, listConverter, mapConverter, typeBased } from '@gs-tools/serializer';
import { Enums } from '@gs-tools/typescript';
import { BooleanType } from '@gs-types';
import { compose, Converter, human, identity, Result, Serializable } from '@nabu';

export function booleanParser(): Converter<boolean, string> {
  return compose(typeBased(BooleanType), human());
}

export function enumParser<E extends string>(enumSet: any): Converter<E, string> {
  const values = new Set(Enums.getAllValues(enumSet));

  return {
    convertBackward(value: string): Result<E> {
      if (values.has(value)) {
        return {success: true, result: value as E};
      }

      return {success: false};
    },

    convertForward(value: E): Result<string> {
      return {success: true, result: value};
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

export function mapParser<K, V>(
    keyParser: Converter<K, string>,
    valueParser: Converter<V, string>,
): Converter<ImmutableMap<K, V>, string> {
  return compose(mapConverter(keyParser, valueParser), human());
}

export function stringParser(): Converter<string, string> {
  return identity<string>();
}
