import { $getKey, $head, $mapPick, $pick, $pipe, asImmutableMap, createImmutableMap, ImmutableMap, ImmutableMapType } from '@gs-tools/collect';
import { BaseDisposable } from '@gs-tools/dispose';
import { BehaviorSubject, from as observableFrom, Observable, of as observableOf } from '@rxjs';
import { map, retry, shareReplay, switchMap } from '@rxjs/operators';
import { _v } from '../app/app';
import { SvgConfig } from './svg-config';

const __run = Symbol('SvgService.run');

export class SvgService extends BaseDisposable {
  private readonly svgObs: ImmutableMap<string, Observable<string>>;

  constructor(svgConfig: ImmutableMap<string, SvgConfig>) {
    super();
    this.svgObs = createSvgObs(svgConfig);
  }

  [__run](): void {
    // TODO: Preload in background.
  }

  getSvg(name: string): Observable<string|null> {
    return $pipe(
        this.svgObs,
        $getKey(name),
        $pick(1),
        $head(),
    ) || observableOf(null);
  }
}

function createSvgObs(
    configs: ImmutableMap<string, SvgConfig>,
): ImmutableMap<string, Observable<string>> {
  return $pipe(
      configs,
      $mapPick(
          1,
          (config): Observable<string> => {
            if (config.type === 'embed') {
              return observableOf(config.content);
            } else {
              // TODO: Retry with exponential backoff.
              return observableFrom<Promise<Response>>(fetch(config.url))
                  .pipe(
                      switchMap(response => observableFrom(response.text())),
                      retry(3),
                      shareReplay(1),
                  );
            }
          },
      ),
      asImmutableMap(),
  );
}

export const $svgConfig = _v.source(
    () => new BehaviorSubject(createImmutableMap<string, SvgConfig>()),
    globalThis,
);

export const $svgService = _v.stream(
    vine => $svgConfig.get(vine)
        .pipe(
          map(config => {
            const service = new SvgService(config);
            service[__run]();

            return service;
          }),
        ),
    globalThis,
);
