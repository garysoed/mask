import {Theme} from '../theme';

import {ThemeLoader} from './theme-loader';

export class ThemeClassLoader implements ThemeLoader {
  constructor(private readonly theme: Theme) {}

  createElement(document: Document): Element {
    const el = document.createElement('style');
    el.innerHTML = this.theme.generateCss();
    return el;
  }
}
