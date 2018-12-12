import { ImmutableSet } from 'gs-tools/export/collect';
import { InstanceofType } from 'gs-types/export';
import { classlist, element, resolveLocators } from 'persona/export/locator';
import { _p, _v } from '../app/app';
import { BackdropConfig } from '../configs/backdrop-config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import backdropTemplate from './backdrop.html';
import { $dialogState, DialogState } from './dialog-service';

export const $ = resolveLocators({
  root: {
    classlist: classlist(element('root.el')),
    el: element('#root', InstanceofType(HTMLDivElement)),
  },
});

@_p.customElement({
  tag: 'mk-backdrop',
  template: backdropTemplate,
})
class Backdrop extends ThemedCustomElementCtrl {
  @_p.render($.root.classlist)
  renderRootClasslist_(
      @_v.vineIn($dialogState) dialogState: DialogState,
  ): ImmutableSet<string> {
    if (dialogState.isOpen) {
      return ImmutableSet.of(['isVisible']);
    } else {
      return ImmutableSet.of();
    }
  }
}

export function backdrop(): BackdropConfig {
  return {
    configure(): void {
      document.body.appendChild(document.createElement('mk-backdrop'));
    },
    tag: 'mk-backdrop',
  };
}
