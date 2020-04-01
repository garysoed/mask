import { Vine } from 'grapevine';
import { instanceofType } from 'gs-types';
import { classlist, element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import backdropTemplate from './backdrop.html';
import { $dialogState } from './dialog-service';


export const $ = {
  root: element('root', instanceofType(HTMLDivElement), {
    classlist: classlist(),
  }),
};

@_p.customElement({
  tag: 'mk-backdrop',
  template: backdropTemplate,
})
export class Backdrop extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
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
