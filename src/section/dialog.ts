import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { ElementWithTagType, InstanceofType } from 'gs-types/export';
import { element, onDom } from 'persona/export/input';
import { classlist, textContent } from 'persona/export/output';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, take, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { Config } from '../app/config';
import { BackdropConfig } from '../configs/backdrop-config';
import { TextIconButtonConfig } from '../configs/text-icon-button-config';
import { ACTION_EVENT } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { $dialogState, DialogState, OpenState } from './dialog-service';
import dialogTemplate from './dialog.html';

export const $ = {
  cancelButton: element('cancelButton', ElementWithTagType('mk-text-icon-button'), {
    classlist: classlist(),
    onAction: onDom(ACTION_EVENT),
  }),
  okButton: element('okButton', ElementWithTagType('mk-text-icon-button'), {
    onAction: onDom(ACTION_EVENT),
  }),
  root: element('root', InstanceofType(HTMLDivElement), {
    classlist: classlist(),
  }),
  title: element('title', ElementWithTagType('h2'), {
    text: textContent(),
  }),
};

@_p.customElement({
  input: [
    $.cancelButton._.onAction,
    $.okButton._.onAction,
  ],
  tag: 'mk-dialog',
  template: dialogTemplate,
})
class Dialog extends ThemedCustomElementCtrl {
  @_p.onCreate()
  onCloseOrCancel_(
      @_v.vineIn($.cancelButton._.onAction.id) onCancelObs: Observable<Event>,
      @_v.vineIn($.okButton._.onAction.id) onOkObs: Observable<Event>,
      @_v.vineIn($dialogState) dialogState: Observable<DialogState>,
  ): Observable<unknown> {
    return merge(
        onCancelObs.pipe(mapTo(true)),
        onOkObs.pipe(mapTo(false)),
    )
    .pipe(
        withLatestFrom(dialogState),
        filter((pair): pair is [boolean, OpenState] => pair[1].isOpen),
        tap(([isCanceled, state]) => state.closeFn(isCanceled)),
    );
  }

  @_p.render($.cancelButton._.classlist)
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

  @_p.render($.root._.classlist)
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

  @_p.render($.title._.text)
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
