import {ThemeLoader} from './theme-loader';

export class UrlThemeLoader implements ThemeLoader {
  constructor(private readonly url: string) {}

  createElement(document: Document): Element {
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = this.url;
    return linkEl;
  }
}
