import { source, stream, Vine } from 'grapevine';
import { defer, from as observableFrom, Observable, of as observableOf } from 'rxjs';
import { map, retry, shareReplay, switchMap } from 'rxjs/operators';

import { SvgConfig } from './svg-config';


const __run = Symbol('SvgService.run');

export class SvgService {
  private readonly svgObsMap: Map<string, Observable<string>>;

  constructor(svgConfig: ReadonlyMap<string, SvgConfig>) {
    this.svgObsMap = createSvgObs(svgConfig);
  }

  [__run](): void {
    // TODO: Preload in background.
  }

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
