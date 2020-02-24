import { Vine } from 'grapevine';
import { InstanceofType } from 'gs-types';
import { classlist, element } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import backdropTemplate from './backdrop.html';
import { $dialogState } from './dialog-service';


export const $ = {
  root: element('root', InstanceofType(HTMLDivElement), {
    classlist: classlist(),
  }),
};

@_p.customElement({
  tag: 'mk-backdrop',
  template: backdropTemplate,
})
export class Backdrop extends ThemedCustomElementCtrl {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.render($.root._.classlist).withFunction(this.renderRootClasslist);
  }

  renderRootClasslist(vine: Vine): Observable<ReadonlySet<string>> {
    return $dialogState.get(vine).pipe(
        map(dialogState => {
          if (dialogState.isOpen) {
            return new Set(['isVisible']);
          } else {
            return new Set();
          }
        }),
    );
  }
}
