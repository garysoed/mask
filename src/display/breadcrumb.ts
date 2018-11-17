import { VineImpl } from 'grapevine/export/main';
import { Errors } from 'gs-tools/export/error';
import { ListParser, ObjectParser, StringParser } from 'gs-tools/export/parse';
import { ImmutableList } from 'gs-tools/src/immutable';
import { HasPropertiesType, InstanceofType, IntersectType, IterableOfType, StringType } from 'gs-types/export';
import { attribute, dispatcher, element, resolveLocators, shadowHost, slot } from 'persona/export/locator';
import { __renderId, ElementListRenderer, SimpleElementRenderer } from 'persona/export/renderer';
import { take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { BreadcrumbClickEvent } from './breadcrumb-event';
import breadcrumbTemplate from './breadcrumb.html';
import { crumb, CrumbConfig } from './crumb';

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
    dispatch: dispatcher(shadowHost),
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
    crumbsSlot: slot(
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
    $.host.dispatch,
    $.theme.el,
  ],
})
class Breadcrumb extends ThemedCustomElementCtrl {
  constructor() {
    super($.theme.el);
  }

  @_p.onDom($.row.el, ACTION_EVENT)
  onRowAction_(event: ActionEvent, vine: VineImpl): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      throw Errors.assert(`target for ${ACTION_EVENT}`)
          .shouldBeAnInstanceOf(Element)
          .butWas(target);
    }

    const key = target.getAttribute('key');
    if (!key) {
      throw Errors.assert(`key for ${target}`).shouldExist().butNot();
    }

    vine.getObservable($.host.dispatch.getReadingId(), this)
        .pipe(take(1))
        .subscribe(dispatcher => {
          dispatcher(new BreadcrumbClickEvent(key));
        });
  }

  @_p.render($.row.crumbsSlot)
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

interface BreadcrumbConfig extends Config {
  dependencies: [CrumbConfig];
}

export function breadcrumb(): BreadcrumbConfig {
  return {
    dependencies: [crumb()],
    tag: 'mk-breadcrumb',
  };
}
