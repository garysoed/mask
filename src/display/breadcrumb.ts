import { $ as $pipe, $asArray, $filterDefined, $map } from 'gs-tools/export/collect';
import { Errors } from 'gs-tools/export/error';
import { ArrayDiff, diffArray, filterNonNull } from 'gs-tools/export/rxjs';
import { objectConverter } from 'gs-tools/export/serializer';
import { elementWithTagType } from 'gs-types';
import { attributeIn, dispatcher, element, listParser, NoopRenderSpec, onDom, PersonaContext, RenderSpec, repeated, SimpleElementRenderSpec, stringParser } from 'persona';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
import { ACTION_EVENT } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import { BreadcrumbClickEvent } from './breadcrumb-event';
import breadcrumbTemplate from './breadcrumb.html';
import { Crumb } from './crumb';


export interface CrumbData {
  display: string;
  key: string;
}

export const $$ = {
  api: {
    dispatch: dispatcher(ACTION_EVENT),
    path: attributeIn<CrumbData[]>(
        'path',
        listParser(
            objectConverter<CrumbData>({
              display: stringParser(),
              key: stringParser(),
            }),
        ),
        [],
    ),
  },
  tag: 'mk-breadcrumb',
};

export const $ = {
  host: element($$.api),
  row: element('row', elementWithTagType('nav'), {
    crumbsSlot: repeated('crumbs'),
    onAction: onDom(ACTION_EVENT),
  }),
};

@_p.customElement({
  dependencies: [Crumb],
  tag: $$.tag,
  template: breadcrumbTemplate,
})
export class Breadcrumb extends ThemedCustomElementCtrl {
  private readonly pathData$ = new BehaviorSubject<ReadonlyMap<string, CrumbData>>(new Map());
  private readonly pathKey$ = new BehaviorSubject<readonly string[]>([]);
  private readonly path$ = this.declareInput($.host._.path);
  private readonly rowOnAction$ = this.declareInput($.row._.onAction);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.row._.crumbsSlot, this.renderCrumbs());
    this.render($.host._.dispatch, this.renderDispatchAction());
    this.addSetup(this.setupCrumbDataForwarding());
  }

  private renderCrumbs(): Observable<ArrayDiff<RenderSpec>> {
    return this.pathKey$
        .pipe(
            diffArray(),
            withLatestFrom(this.pathData$),
            map(([diff, map]: [ArrayDiff<string>, ReadonlyMap<string, CrumbData>]) => {
              switch (diff.type) {
                case 'delete':
                  return {
                    type: 'delete' as 'delete',
                    index: diff.index,
                    value: new NoopRenderSpec(),
                  };
                case 'init':
                  const crumbDataList = $pipe(
                      diff.value,
                      $map(key => map.get(key)),
                      $filterDefined(),
                      $map(crumbData => renderCrumbData(crumbData)),
                      $asArray(),
                  );

                  return {
                    type: 'init' as 'init',
                    value: crumbDataList,
                  };
                case 'insert':
                  const insertData = map.get(diff.value);
                  if (!insertData) {
                    return null;
                  }

                  return {
                    index: diff.index,
                    type: 'insert' as 'insert',
                    value: renderCrumbData(insertData),
                  };
                case 'set':
                  const setData = map.get(diff.value);
                  if (!setData) {
                    return null;
                  }

                  return {
                    index: diff.index,
                    type: 'set' as 'set',
                    value: renderCrumbData(setData),
                  };
              }
            }),
            filterNonNull<ArrayDiff<RenderSpec>|null>(),
        );
  }

  private renderDispatchAction(): Observable<BreadcrumbClickEvent> {
    return this.rowOnAction$
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

  private setupCrumbDataForwarding(): Observable<unknown> {
    return this.path$
        .pipe(
            tap(path => {
              // Map has to be updated first, since the keys will cause rendering update.
              const map = new Map<string, CrumbData>();
              for (const data of path) {
                map.set(data.key, data);
              }
              this.pathData$.next(map);

              this.pathKey$.next(path.map(({key}) => key));
            }),
        );
  }
}

function renderCrumbData(data: CrumbData): RenderSpec {
  return new SimpleElementRenderSpec(
      'mk-crumb',
      observableOf(new Map([
        ['display', data.display],
        ['key', data.key],
        ['tabindex', `0`],
      ])),
  );
}
