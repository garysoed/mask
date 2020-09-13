import { instanceofType } from 'gs-types';
import { classlist, element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import backdropTemplate from './backdrop.html';
import { $dialogService } from './dialog-service';


export const $ = {
  root: element('root', instanceofType(HTMLDivElement), {
    classlist: classlist(),
  }),
};

@_p.customElement({
  tag: 'mk-backdrop',
  template: backdropTemplate,
  api: {},
})
export class Backdrop extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.render($.root._.classlist, this.renderRootClasslist());
  }

  renderRootClasslist(): Observable<ReadonlySet<string>> {
    return $dialogService.get(this.vine).pipe(
        switchMap(service => service.getStateObs()),
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
