import { VineImpl } from '@grapevine/main';
import { $pipe, $push, asImmutableMap, createImmutableSet, ImmutableSet } from '@gs-tools/collect';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { element, onDom } from '@persona/input';
import { classlist, textContent } from '@persona/output';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, take, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import * as dialogCloseSvg from '../asset/dialog_close.svg';
import * as dialogConfirmSvg from '../asset/dialog_confirm.svg';
import { SvgConfig } from '../display/svg-config';
import { $svgConfig } from '../display/svg-service';
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
  configure(vine: VineImpl): void {
    vine.getObservable($svgConfig)
        .pipe(take(1))
        .subscribe(svgConfig => {
          const newConfig = $pipe(
              svgConfig,
              $push<[string, SvgConfig], string>(
                  ['dialog_close', {type: 'embed', content: dialogCloseSvg}],
                  ['dialog_confirm', {type: 'embed', content: dialogConfirmSvg}],
              ),
              asImmutableMap(),
          );

          vine.setValue($svgConfig, newConfig);
        });
  },
  tag: 'mk-dialog',
  template: dialogTemplate,
})
export class Dialog extends ThemedCustomElementCtrl {
  @_p.onCreate()
  onCloseOrCancel_(
      @_p.input($.cancelButton._.onAction) onCancelObs: Observable<Event>,
      @_p.input($.okButton._.onAction) onOkObs: Observable<Event>,
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
        return createImmutableSet([]);
      }

      return createImmutableSet(['isVisible']);
    }));
  }

  @_p.render($.root._.classlist)
  renderRootClasses_(
      @_v.vineIn($dialogState) dialogStateObs: Observable<DialogState>,
  ): Observable<ImmutableSet<string>> {
    return dialogStateObs.pipe(map(dialogState => {
      if (dialogState.isOpen) {
        return createImmutableSet(['isVisible']);
      } else {
        return createImmutableSet();
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
