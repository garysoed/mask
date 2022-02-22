import {Context, ElementSpec, ocase, renderNode, RenderSpec, root} from 'persona';
import {RenderValueFn} from 'persona/export/internal';
import {Observable, of, OperatorFunction} from 'rxjs';

import {$themeLoader} from '../app/app';

import {ThemeLoader, THEME_LOADER_TYPE} from './loader/theme-loader';


const SELECTOR = root({
  styleEl: ocase(THEME_LOADER_TYPE),
});

export function renderTheme(
    context: Context<ElementSpec>,
    themeSelector?: (fn: RenderValueFn<ThemeLoader>) => OperatorFunction<ThemeLoader, ThemeLoader>,
): Observable<unknown> {
  const renderContext = {
    document: context.element.ownerDocument,
    vine: context.vine,
  };

  if (themeSelector) {
    return $themeLoader.get(context.vine).pipe(
        themeSelector(themeLoader => renderThemeLoader(themeLoader, context)),
    );
  }

  return $themeLoader.get(context.vine).pipe(
      SELECTOR.styleEl(context.shadowRoot, renderContext)
          .update(themeLoader => renderThemeLoader(themeLoader, context)),
  );
}

function renderThemeLoader(themeLoader: ThemeLoader, context: Context<ElementSpec>): Observable<RenderSpec> {
  return of(renderNode({
    node: themeLoader.createElement(context.shadowRoot.ownerDocument),
  }));
}