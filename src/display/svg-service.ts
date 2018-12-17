import { staticSourceId, staticStreamId } from 'grapevine/export/component';
import { ImmutableMap } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { InstanceofType } from 'gs-types/export';
import { from as observableFrom, Observable } from 'rxjs';
import { catchError, retry, shareReplay, switchMap } from 'rxjs/operators';
import { _v } from '../app/app';

const __run = Symbol('SvgService.run');

export class SvgService extends BaseDisposable {
  private readonly svgObs: ImmutableMap<string, Observable<string>>;

  constructor(svgConfig: ImmutableMap<string, string>) {
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

function createSvgObs(configs: ImmutableMap<string, string>):
    ImmutableMap<string, Observable<string>> {
  return configs
      .map((url): Observable<string> => {
        // TODO: Retry with exponential backoff.
        return observableFrom<Response>(fetch(url))
            .pipe(
                switchMap(response => response.text()),
                retry(3),
                shareReplay(1),
            );
      });
}

export const $svgConfig = staticSourceId(
    'SvgService.config',
    InstanceofType<ImmutableMap<string, string>>(ImmutableMap),
);
_v.builder.source($svgConfig, ImmutableMap.of());

export const $svgService = staticStreamId(
    'SvgService',
    InstanceofType(SvgService),
);
_v.builder.stream(
    $svgService,
    config => {
      const service = new SvgService(config);
      service[__run]();

      return service;
    },
    $svgConfig,
);
