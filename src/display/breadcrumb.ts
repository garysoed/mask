import { $getKey, $head, $map, $pick, $pipe, asImmutableList, createImmutableList, ImmutableList, ImmutableMap } from '@gs-tools/collect';
import { Errors } from '@gs-tools/error';
import { ArrayDiff, ArraySubject, filterNonNull, MapSubject } from '@gs-tools/rxjs';
import { objectConverter } from '@gs-tools/serializer';
import { InstanceofType } from '@gs-types';
import { InitFn } from '@persona';
import { attributeIn, element, onDom } from '@persona/input';
import { dispatcher, repeated } from '@persona/output';
import { __renderId } from '@persona/renderer';
import { Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { ACTION_EVENT } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { listParser, stringParser } from '../util/parsers';
import { BreadcrumbClickEvent } from './breadcrumb-event';
import breadcrumbTemplate from './breadcrumb.html';
import { Crumb } from './crumb';

interface CrumbData {
  'display': string;
  'key': string;
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
    crumbsSlot: repeated('crumbs', 'mk-crumb'),
    onAction: onDom(ACTION_EVENT),
  }),
};

@_p.customElement({
  dependencies: [Crumb],
  tag: 'mk-breadcrumb',
  template: breadcrumbTemplate,
})
export class Breadcrumb extends ThemedCustomElementCtrl {
  private readonly pathDataSubject = new MapSubject<string, CrumbData>();
  private readonly pathKeySubject = new ArraySubject<string>();
  private readonly pathObs = _p.input($.host._.path, this);
  private readonly rowOnActionObs = _p.input($.row._.onAction, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.row._.crumbsSlot).withVine(_v.stream(this.renderCrumbs, this)),
      _p.render($.host._.dispatch).withVine(_v.stream(this.renderDispatchAction, this)),
      this.setupCrumbDataForwarding(),
    ];
  }

  renderCrumbs(): Observable<ArrayDiff<Map<string, string>>> {
    return this.pathKeySubject.getDiffs()
        .pipe(
            withLatestFrom(this.pathDataSubject.getObs()),
            map(([diff, map]) => {
              switch (diff.type) {
                case 'delete':
                  return diff;
                case 'init':
                  const crumbDataList = $pipe(
                      map,
                      $getKey(...diff.value),
                      $pick(1),
                      $map(renderCrumbData),
                      asImmutableList(),
                  );

                  return {type: 'init' as 'init', value: [...crumbDataList]};
                case 'insert':
                  const insertData = $pipe(map, $getKey(diff.value), $pick(1), $head());
                  if (!insertData) {
                    return null;
                  }

                  return {
                    index: diff.index,
                    type: 'insert',
                    value: renderCrumbData(insertData),
                  };
                case 'set':
                  const setData = $pipe(map, $getKey(diff.value), $pick(1), $head());
                  if (!setData) {
                    return null;
                  }

                  return {
                    index: diff.index,
                    type: 'set',
                    value: renderCrumbData(setData),
                  };
              }
            }),
            filterNonNull<ArrayDiff<Map<string, string>>|null>(),
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

  setupCrumbDataForwarding(): InitFn {
    return () => this.pathObs
        .pipe(
            tap(path => {
              // Map has to be updated first, since the keys will cause rendering update.
              const map = new Map<string, CrumbData>();
              for (const data of path) {
                map.set(data.key, data);
              }
              this.pathDataSubject.setAll(map);

              const keys = [...$pipe(path, $pick('key'), asImmutableList())];
              this.pathKeySubject.setAll(keys);
            }),
        );
  }
}

function renderCrumbData(data: CrumbData): Map<string, string> {
  return new Map([
    ['display', data.display],
    ['key', data.key],
  ]);
}
