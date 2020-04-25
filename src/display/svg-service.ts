import { source, stream, Vine } from 'grapevine';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { from as observableFrom, Observable, of as observableOf } from 'rxjs';
import { map, retry, shareReplay, switchMap } from 'rxjs/operators';

import { SvgConfig } from './svg-config';


const __run = Symbol('SvgService.run');

export class SvgService extends BaseDisposable {
  private readonly svgObsMap: Map<string, Observable<string>>;

  constructor(svgConfig: ReadonlyMap<string, SvgConfig>) {
    super();
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
}

const $svgConfig = source<ReadonlyMap<string, SvgConfig>>(() => new Map());

export function registerSvg(vine: Vine, key: string, config: SvgConfig): void {
  $svgConfig.set(vine, map => new Map([...map, [key, config]]));
}

export const $svgService = stream(
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
