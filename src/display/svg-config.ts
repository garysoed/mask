import { Observable } from 'rxjs';

interface RemoteSvgConfig {
  readonly type: 'remote';
  readonly url: string;
}

interface EmbeddedSvgConfig {
  readonly content: string;
  readonly type: 'embed';
}

interface ObservableSvgConfig {
  readonly content$: Observable<string>;
  readonly type: 'observable';
}

export type SvgConfig = EmbeddedSvgConfig|ObservableSvgConfig|RemoteSvgConfig;
