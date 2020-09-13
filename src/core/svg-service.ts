import { source, Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { defer, from as observableFrom, Observable, of as observableOf } from 'rxjs';
import { map, retry, shareReplay, switchMap } from 'rxjs/operators';

import { SvgConfig } from './svg-config';


const __run = Symbol('SvgService.run');

/**
 * Manages and caches SVGs in the app.
 *
 * @sealed
 * @thModule display
 */
export class SvgService {
  /**
   * @internal
   */
  constructor(private readonly vine: Vine) { }

  /**
   * @internal
   */
  [__run](): void {
    // TODO: Preload in background.
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
    return this.svgObsMap$.pipe(switchMap(svgObsMap => svgObsMap.get(name) || observableOf(null)));
  }

  @cache()
  private get svgObsMap$(): Observable<ReadonlyMap<string, Observable<string>>> {
    return $svgConfig.get(this.vine).pipe(
        map(configs => {
          const obsMap = new Map<string, Observable<string>>();
          for (const [key, config] of configs) {
            obsMap.set(key, loadSvg(config));
          }

          return obsMap;
        }),
    );
  }
}

function loadSvg(config: SvgConfig): Observable<string> {
  switch (config.type) {
    case 'embed':
      return observableOf(config.content);
    case 'observable':
      return config.content$;
    case 'remote':
      // TODO: Retry with exponential backoff.
      return defer(() => fetch(config.url))
          .pipe(
              switchMap(response => observableFrom(response.text())),
              retry(3),
              shareReplay(1),
          );

  }
}

const $svgConfig = source<ReadonlyMap<string, SvgConfig>>('svgConfig', () => new Map());

export function registerSvg(vine: Vine, key: string, config: SvgConfig): void {
  $svgConfig.set(vine, map => new Map([...map, [key, config]]));
}

/**
 * Grapevine key to get the {@link SvgService} instance.
 *
 * @thModule display
 */
export const $svgService = source(
    'SvgService',
    vine => {
      const service = new SvgService(vine);
      service[__run]();
      return service;
    },
);
