import {BehaviorSubject} from 'rxjs';

import {$themeLoader} from '../app/app';
import {UrlThemeLoader} from '../theme/loader/url-theme-loader';

export const THEME_LOADER_TEST_OVERRIDE = {
  override: $themeLoader,
  withValue: new BehaviorSubject(new UrlThemeLoader('base/test.css')),
};