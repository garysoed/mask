import { ImmutableList } from '@gs-tools/collect';
import { integerConverter, listConverter, typeBased } from '@gs-tools/serializer';
import { BooleanType } from 'gs-types/export';
import { human } from 'nabu/export/grammar';
import { Converter, Serializable } from 'nabu/export/main';
import { compose, identity } from 'nabu/export/util';

export function booleanParser(): Converter<boolean, string> {
  return compose(typeBased(BooleanType), human());
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
