import { $map, $pipe, asImmutableList, createImmutableList, ImmutableList } from '@gs-tools/collect';
import { Errors } from '@gs-tools/error';
import { objectConverter } from '@gs-tools/serializer';
import { InstanceofType } from '@gs-types';
import { InitFn } from '@persona';
import { attributeIn, element, onDom } from '@persona/input';
import { dispatcher, slot } from '@persona/output';
import { __renderId, ElementListRenderer, SimpleElementRenderer } from '@persona/renderer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { ACTION_EVENT } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { listParser, stringParser } from '../util/parsers';
import { BreadcrumbClickEvent } from './breadcrumb-event';
import breadcrumbTemplate from './breadcrumb.html';
import { Crumb } from './crumb';

interface CrumbData {
  display: string;
  key: string;
}

interface RenderedCrumbData extends CrumbData {
  [__renderId]: string;
}

export const $ = {
  host: element({
    dispatch: dispatcher(ACTION_EVENT),
    path: attributeIn<ImmutableList<CrumbData>>(
        'path',
        listParser(
            objectConverter<CrumbData>({
              display: stringParser(),
              key: stringParser(),
            }),
        ),
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
  private readonly pathObs = _p.input($.host._.path, this);
  private readonly rowOnActionObs = _p.input($.row._.onAction, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.row._.crumbsSlot).withVine(_v.stream(this.renderCrumbs, this)),
      _p.render($.host._.dispatch).withVine(_v.stream(this.renderDispatchAction, this)),
    ];
  }

  renderCrumbs(): Observable<ImmutableList<RenderedCrumbData>> {
    return this.pathObs
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

  renderDispatchAction(): Observable<BreadcrumbClickEvent> {
    return this.rowOnActionObs
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
