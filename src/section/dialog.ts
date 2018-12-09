import { ImmutableSet } from 'gs-tools/export/collect';
import { InstanceofType } from 'gs-types/export';
import { classlist, element, resolveLocators } from 'persona/export/locator';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { $dialogState, DialogState } from './dialog-service';
import dialogTemplate from './dialog.html';

export const $ = resolveLocators({
  root: {
    classlist: classlist(element('root.el')),
    el: element('#root', InstanceofType(HTMLDivElement)),
  },
});

@_p.customElement({
  tag: 'mk-dialog',
  template: dialogTemplate,
})
class Dialog extends ThemedCustomElementCtrl {
  @_p.render($.root.classlist)
  renderRootClasses_(@_v.vineIn($dialogState) dialogState: DialogState): ImmutableSet<string> {
    if (dialogState.isOpen) {
      return ImmutableSet.of(['isVisible']);
    } else {
      return ImmutableSet.of();
    }
  }
}

export function dialog(): Config {
  return {tag: 'mk-dialog'};
}
