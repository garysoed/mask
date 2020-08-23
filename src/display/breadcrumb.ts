import { $asArray, $filterDefined, $map, $pipe } from 'gs-tools/export/collect';
import { objectConverter } from 'gs-tools/export/serializer';
import { elementWithTagType } from 'gs-types';
import { attributeIn, dispatcher, element, host, listParser, multi, onDom, PersonaContext, renderCustomElement, stringParser } from 'persona';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
import { ACTION_EVENT } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import { BreadcrumbClickEvent } from './breadcrumb-event';
import breadcrumbTemplate from './breadcrumb.html';
import { $crumb, Crumb } from './crumb';


export interface CrumbData {
  readonly display: string;
  readonly key: string;
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
  host: host($$.api),
  row: element('row', elementWithTagType('nav'), {
    crumbsSlot: multi('crumbs'),
    onAction: onDom(ACTION_EVENT),
  }),
};

@_p.customElement({
  ...$$,
  dependencies: [Crumb],
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

  private renderCrumbs(): Observable<readonly Node[]> {
    return this.pathKey$
        .pipe(
            withLatestFrom(this.pathData$),
            switchMap(([keys, pathData]) => {
              const node$List = $pipe(
                  keys,
                  $map(key => pathData.get(key)),
                  $filterDefined(),
                  $map(crumbData => renderCustomElement(
                      $crumb,
                      {
                        inputs: {
                          display: observableOf(crumbData.display),
                          key: observableOf(crumbData.key),
                        },
                        attrs: new Map([['tabindex', observableOf('0')]]),
                      },
                      this.context,
                  )),
                  $asArray(),
              );

              if (node$List.length <= 0) {
                return observableOf([]);
              }

              return combineLatest(node$List);
            }),
        );
  }

  private renderDispatchAction(): Observable<BreadcrumbClickEvent> {
    return this.rowOnAction$
        .pipe(
            map(event => {
              const target = event.target;
              if (!(target instanceof Element)) {
                throw Error(`target for ${ACTION_EVENT} should be an Element`);
              }

              const key = target.getAttribute('key');
              if (!key) {
                throw Error(`key for ${target} is missing`);
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
