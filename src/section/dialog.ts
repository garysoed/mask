import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { ElementWithTagType, InstanceofType } from 'gs-types/export';
import { classlist, element, resolveLocators, textContent } from 'persona/export/locator';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { BackdropConfig } from '../configs/backdrop-config';
import { TextIconButtonConfig } from '../configs/text-icon-button-config';
import { ACTION_EVENT } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { $dialogState, DialogState } from './dialog-service';
import dialogTemplate from './dialog.html';

export const $ = resolveLocators({
  cancelButton: {
    classlist: classlist(element('cancelButton.el')),
    el: element('#cancelButton', ElementWithTagType('mk-text-icon-button')),
  },
  okButton: {
    el: element('#okButton', ElementWithTagType('mk-text-icon-button')),
  },
  root: {
    classlist: classlist(element('root.el')),
    el: element('#root', InstanceofType(HTMLDivElement)),
  },
  title: {
    el: element('#title', ElementWithTagType('h2')),
    text: textContent(element('title.el')),
  },
});

@_p.customElement({
  tag: 'mk-dialog',
  template: dialogTemplate,
  watch: [
    $.okButton.el,
  ],
})
class Dialog extends ThemedCustomElementCtrl {
  private closeDialog_(vine: VineImpl, isCanceled: boolean): void {
    this.addSubscription(
        vine.getObservable($dialogState)
            .pipe(take(1))
            .subscribe(state => {
              if (!state.isOpen) {
                return;
              }

              state.closeFn(isCanceled);
            }),
    );
  }

  @_p.onDom($.cancelButton.el, ACTION_EVENT)
  onCancelButtonAction_(event: Event, vine: VineImpl): void {
    this.closeDialog_(vine, true);
  }

  @_p.onDom($.okButton.el, ACTION_EVENT)
  onOkButtonAction_(event: Event, vine: VineImpl): void {
    this.closeDialog_(vine, false);
  }

  @_p.render($.cancelButton.classlist)
  renderCancelButtonClasses_(
      @_v.vineIn($dialogState) dialogStateObs: Observable<DialogState>,
  ): Observable<ImmutableSet<string>> {
    return dialogStateObs.pipe(map(dialogState => {
      if (!dialogState.isOpen || !dialogState.cancelable) {
        return ImmutableSet.of([]);
      }

      return ImmutableSet.of(['isVisible']);
    }));
  }

  @_p.render($.root.classlist)
  renderRootClasses_(
      @_v.vineIn($dialogState) dialogStateObs: Observable<DialogState>,
  ): Observable<ImmutableSet<string>> {
    return dialogStateObs.pipe(map(dialogState => {
      if (dialogState.isOpen) {
        return ImmutableSet.of(['isVisible']);
      } else {
        return ImmutableSet.of();
      }
    }));
  }

  @_p.render($.title.text)
  renderTitle_(
      @_v.vineIn($dialogState) dialogStateObs: Observable<DialogState>,
  ): Observable<string> {
    return dialogStateObs.pipe(map(dialogState => {
      if (dialogState.isOpen) {
        return dialogState.title;
      } else {
        return '';
      }
    }));
  }
}

export function dialog(
    backdropConfig: BackdropConfig,
    textIconButtonConfig: TextIconButtonConfig,
): Config {
  return {
    dependencies: [
      backdropConfig,
      textIconButtonConfig,
    ],
    tag: 'mk-dialog',
  };
}
