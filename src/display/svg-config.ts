interface RemoteSvgConfig {
  type: 'remote';
  url: string;
}

interface EmbeddedSvgConfig {
  content: string;
  type: 'embed';
}

export type SvgConfig = EmbeddedSvgConfig|RemoteSvgConfig;
