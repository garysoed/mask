import {Context, ElementSpec, osingle, renderNode, RenderSpec, root} from 'persona';
import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {$themeLoader} from '../app/app';

const SELECTOR = root({
  styleEl: osingle(),
});

export function renderTheme(
    context: Context<ElementSpec>,
    themeSelector?: OperatorFunction<RenderSpec, unknown>,
): Observable<unknown> {
  const renderContext = {
    document: context.element.ownerDocument,
    vine: context.vine,
  };
  const selector = themeSelector ?? SELECTOR.styleEl(context.shadowRoot, renderContext).update();
  return $themeLoader.get(context.vine).pipe(
      map(themeLoader => renderNode({
        id: {},
        node: themeLoader.createElement(context.shadowRoot.ownerDocument),
      })),
      selector,
  );
}