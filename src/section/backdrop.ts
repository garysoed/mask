import { createImmutableSet, ImmutableSet } from '@gs-tools/collect';
import { InstanceofType } from '@gs-types';
import { element } from '@persona/input';
import { classlist } from '@persona/output';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import backdropTemplate from './backdrop.html';
import { $dialogState, DialogState } from './dialog-service';

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
  @_p.render($.root._.classlist)
  renderRootClasslist_(
      @_v.vineIn($dialogState) dialogStateObs: Observable<DialogState>,
  ): Observable<ImmutableSet<string>> {
    return dialogStateObs.pipe(
        map(dialogState => {
          if (dialogState.isOpen) {
            return createImmutableSet(['isVisible']);
          } else {
            return createImmutableSet();
          }
        }),
    );
  }
}
