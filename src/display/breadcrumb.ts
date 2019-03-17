import { $map, $pipe, asImmutableList, createImmutableList, ImmutableList } from 'gs-tools/export/collect';
import { Errors } from 'gs-tools/export/error';
import { objectConverter } from 'gs-tools/export/serializer';
import { HasPropertiesType, InstanceofType, IterableOfType, StringType } from 'gs-types/export';
import { attributeIn, element, onDom } from 'persona/export/input';
import { dispatcher, slot } from 'persona/export/output';
import { __renderId, ElementListRenderer, SimpleElementRenderer } from 'persona/export/renderer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p } from '../app/app';
import { Config } from '../app/config';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { listParser, stringParser } from '../util/parsers';
import { BreadcrumbClickEvent } from './breadcrumb-event';
import breadcrumbTemplate from './breadcrumb.html';
import { crumb, Crumb, CrumbConfig } from './crumb';

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

export const $ = {
  host: element({
    dispatch: dispatcher(),
    path: attributeIn<ImmutableList<CrumbData>>(
        'path',
        listParser(
            objectConverter<CrumbData>({
              display: stringParser(),
              key: stringParser(),
            }),
        ),
        IterableOfType<CrumbData, ImmutableList<CrumbData>>(crumbDataType),
        createImmutableList([]),
    ),
  }),
  row: element('row', InstanceofType(HTMLDivElement), {
    crumbsSlot: slot(
        'crumbs',
        new ElementListRenderer<RenderedCrumbData>(
            new SimpleElementRenderer<RenderedCrumbData>(
              'mk-crumb',
              {
                [__renderId]: stringParser(),
                display: stringParser(),
                key: stringParser(),
              },
            ),
        ),
    ),
    onAction: onDom(ACTION_EVENT),
  }),
};

@_p.customElement({
  dependencies: [Crumb],
  tag: 'mk-breadcrumb',
  template: breadcrumbTemplate,
})
export class Breadcrumb extends ThemedCustomElementCtrl {

  @_p.render($.row._.crumbsSlot)
  renderCrumbs_(
      @_p.input($.host._.path) pathObs: Observable<ImmutableList<CrumbData>>,
  ): Observable<ImmutableList<RenderedCrumbData>> {
    return pathObs
        .pipe(
            map(path => $pipe(
                path,
                $map(({key, display}) => ({
                  [__renderId]: key,
                  display,
                  key,
                })),
                asImmutableList(),
            )),
        );
  }
  @_p.render($.host._.dispatch)
  renderDispatchAction_(
      @_p.input($.row._.onAction) onActionObs: Observable<ActionEvent>,
  ): Observable<BreadcrumbClickEvent> {
    return onActionObs
        .pipe(
            map(event => {
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

              return key;
            }),
            map(key => new BreadcrumbClickEvent(key)),
        );
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
