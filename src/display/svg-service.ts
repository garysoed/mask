import { staticSourceId, staticStreamId } from 'grapevine/export/component';
import { ImmutableMap } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { InstanceofType } from 'gs-types/export';
import { from as observableFrom, Observable, of as observableOf } from 'rxjs';
import { map, retry, shareReplay, switchMap } from 'rxjs/operators';
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

  getSvg(name: string): Observable<string>|null {
    return this.svgObs.get(name) || null;
  }
}

function createSvgObs(configs: ImmutableMap<string, SvgConfig>):
    ImmutableMap<string, Observable<string>> {
  return configs
      .map((config): Observable<string> => {
        if (config.type === 'embed') {
          return observableOf(config.content);
        } else {
          // TODO: Retry with exponential backoff.
          return observableFrom<Response>(fetch(config.url))
              .pipe(
                  switchMap(response => response.text()),
                  retry(3),
                  shareReplay(1),
              );
        }
      });
}

export const $svgConfig = staticSourceId(
    'SvgService.config',
    InstanceofType<ImmutableMap<string, SvgConfig>>(ImmutableMap),
);
_v.builder.source($svgConfig, ImmutableMap.of());

export const $svgService = staticStreamId(
    'SvgService',
    InstanceofType(SvgService),
);
_v.builder.stream(
    $svgService,
    configObs => configObs
        .pipe(
            map(config => {
              const service = new SvgService(config);
              service[__run]();

              return service;
            }),
        ),
    $svgConfig,
);
