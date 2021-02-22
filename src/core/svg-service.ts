import {source, subjectSource, Vine} from 'grapevine';
import {$asArray, $map, $pipe} from 'gs-tools/export/collect';
import {combineLatest, defer, from as observableFrom, Observable, of} from 'rxjs';
import {map, retry, shareReplay, switchMap} from 'rxjs/operators';

import {SvgConfig} from './svg-config';


const __run = Symbol('SvgService.run');

/**
 * Manages and caches SVGs in the app.
 *
 * @sealed
 * @thModule display
 */
export class SvgService {
  private readonly svgMap$ = createSvgObs(this.svgConfig$);

  /**
   * @internal
   */
  constructor(private readonly svgConfig$: Observable<ReadonlyMap<string, SvgConfig>>) {
  }

  /**
   * @internal
   */
  [__run](): void {
    // Noop
  }

  /**
   * Emits the SVG string corresponding to the given SVG name.
   *
   * @remarks
   * Emits null if the SVG does not exist.
   *
   * If the SVG source is remote, this will load the SVG.
   *
   * @param name - SVG ID to retrieve.
   * @returns Observable that emits the SVG string if exists, null otherwise.
   */
  getSvg(name: string): Observable<string|null> {
    return this.svgMap$.pipe(
        map(map => {
          return map.get(name) ?? null;
        }),
    );
  }
}

function createSvgObs(
    configs$: Observable<ReadonlyMap<string, SvgConfig>>,
): Observable<ReadonlyMap<string, string>> {
  return configs$.pipe(
      switchMap(configs => {
        if (configs.size <= 0) {
          return of([]);
        }
        const pairs$ = $pipe(
            configs,
            $map(([key, config]) => loadSvg(config).pipe(map(result => [key, result] as const))),
            $asArray(),
        );
        return combineLatest(pairs$);
      }),
      map(pairs => new Map(pairs)),
  );
}

function loadSvg(config: SvgConfig): Observable<string> {
  switch (config.type) {
    case 'embed':
      return of(config.content);
    case 'observable':
      return config.content$;
    case 'remote':
      return defer(() => fetch(config.url))
          .pipe(
              switchMap(response => observableFrom(response.text())),
              retry(3),
              shareReplay(1),
          );

  }
}

const $svgConfig = subjectSource<ReadonlyMap<string, SvgConfig>>(
    'svgConfig',
    () => new Map(),
);

export function registerSvg(vine: Vine, key: string, config: SvgConfig): void {
  $svgConfig.set(
      vine,
      configs => new Map([...configs, [key, config]]),
  );
}

/**
 * Grapevine key to get the {@link SvgService} instance.
 *
 * @thModule display
 */
export const $svgService = source(
    'SvgService',
    vine => {
      const service = new SvgService($svgConfig.get(vine));
      service[__run]();

      return service;
    },
);
