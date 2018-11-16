import { ListParser, ObjectParser, StringParser } from 'gs-tools/export/parse';
import { ImmutableList } from 'gs-tools/src/immutable';
import { HasPropertiesType, InstanceofType, IntersectType, IterableOfType, StringType } from 'gs-types/export';
import { attribute, element, resolveLocators, shadowHost, slot } from 'persona/export/locator';
import { __renderId, ElementListRenderer, SimpleElementRenderer } from 'persona/export/renderer';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import breadcrumbTemplate from './breadcrumb.html';
import { crumb } from './crumb';

interface CrumbData {
  display: string;
  key: string;
}
const crumbDataType = HasPropertiesType({
  display: StringType,
  key: StringType,
});

interface RenderedCrumbData extends CrumbData {
  [__renderId]: string;
}
const renderedCrumbDataType = IntersectType<RenderedCrumbData>([
  crumbDataType,
  HasPropertiesType({[__renderId]: StringType}),
]);

export const $ = resolveLocators({
  host: {
    el: shadowHost,
    path: attribute<ImmutableList<CrumbData>>(
        shadowHost,
        'path',
        ListParser(
            ObjectParser({
              display: StringParser,
              key: StringParser,
            }),
        ),
        IterableOfType<CrumbData, ImmutableList<CrumbData>>(crumbDataType),
        ImmutableList.of([]),
    ),
  },
  row: {
    crumbs: slot(
        element('row.el'),
        'crumbs',
        new ElementListRenderer<RenderedCrumbData>(
            new SimpleElementRenderer<RenderedCrumbData>(
              'mk-crumb',
              {
                [__renderId]: StringParser,
                display: StringParser,
                key: StringParser,
              },
            ),
        ),
        IterableOfType(renderedCrumbDataType),
    ),
    el: element('#row', InstanceofType(HTMLDivElement)),
  },
  theme: {
    el: element('#theme', InstanceofType(HTMLStyleElement)),
  },
});

@_p.customElement({
  tag: 'mk-breadcrumb',
  template: breadcrumbTemplate,
  watch: [
    $.row.el,
    $.theme.el,
  ],
})
class Breadcrumb extends ThemedCustomElementCtrl {
  constructor() {
    super($.theme.el);
  }

  @_p.render($.row.crumbs)
  renderCrumbs_(
      @_p.input($.host.path) path: ImmutableList<CrumbData>,
  ): ImmutableList<RenderedCrumbData> {
    return path.mapItem(({key, display}) => ({
      [__renderId]: key,
      display,
      key,
    }));
  }
}

export function breadcrumb(): Config {
  return {
    ctor: Breadcrumb,
    dependencies: [crumb()],
  };
}
