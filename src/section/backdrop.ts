import { Vine } from 'grapevine';
import { InstanceofType } from 'gs-types';
import { classlist, element, InitFn } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p, _v } from '../app/app';
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
  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.renderStream($.root._.classlist, this.renderRootClasslist),
    ];
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
