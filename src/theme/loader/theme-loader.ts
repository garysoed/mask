import {hasPropertiesType, instanceofType} from 'gs-types';

export interface ThemeLoader {
  createElement(document: Document): Element;
}

export const THEME_LOADER_TYPE = hasPropertiesType<ThemeLoader>({
  createElement: instanceofType(Function),
});