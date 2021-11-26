import {Context, ElementSpec, osingle, renderNode, root} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {$themeLoader} from '../app/app';

const SELECTOR = root({
  styleEl: osingle(),
});

export function renderTheme(context: Context<ElementSpec>): Observable<unknown> {
  const renderContext = {
    document: context.element.ownerDocument,
    vine: context.vine,
  };
  return $themeLoader.get(context.vine).pipe(
      map(themeLoader => renderNode({
        id: {},
        node: themeLoader.createElement(context.shadowRoot.ownerDocument),
      })),
      SELECTOR.styleEl(context.shadowRoot, renderContext).update(),
  );
}