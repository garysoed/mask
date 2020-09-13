import { source, stream, Vine } from 'grapevine';
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
  private readonly svgObsMap: Map<string, Observable<string>>;

  /**
   * @internal
   */
  constructor(svgConfig: ReadonlyMap<string, SvgConfig>) {
    this.svgObsMap = createSvgObs(svgConfig);
  }

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
    return this.svgObsMap.get(name) || observableOf(null);
  }
}

function createSvgObs(
    configs: ReadonlyMap<string, SvgConfig>,
): Map<string, Observable<string>> {
  const obsMap = new Map<string, Observable<string>>();
  for (const [key, config] of configs) {
    obsMap.set(key, loadSvg(config));
  }

  return obsMap;
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
export const $svgService = stream(
    'SvgService',
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
