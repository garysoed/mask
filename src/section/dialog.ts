import { Vine } from '@grapevine';
import { $pipe, $push, asImmutableMap, createImmutableSet, ImmutableSet } from '@gs-tools/collect';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { classlist, element, InitFn, onDom, textContent } from '@persona';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, take, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import * as dialogCloseSvg from '../asset/dialog_close.svg';
import * as dialogConfirmSvg from '../asset/dialog_confirm.svg';
import { SvgConfig } from '../display/svg-config';
import { $svgConfig } from '../display/svg-service';
import { ACTION_EVENT } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { Backdrop } from './backdrop';
import { $dialogState, OpenState } from './dialog-service';
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
  configure(vine: Vine): void {
    const svgSubject = $svgConfig.get(vine);
    svgSubject
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

          svgSubject.next(newConfig);
        });
  },
  dependencies: [
    Backdrop,
  ],
  tag: 'mk-dialog',
  template: dialogTemplate,
})
export class Dialog extends ThemedCustomElementCtrl {
  private readonly onCancelObs = _p.input($.cancelButton._.onAction, this);
  private readonly onOkObs = _p.input($.okButton._.onAction, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      vine => this.setupOnCloseOrCancel(vine),
      _p.render($.cancelButton._.classlist)
          .withVine(_v.stream(this.renderCancelButtonClasses, this)),
      _p.render($.root._.classlist).withVine(_v.stream(this.renderRootClasses, this)),
      _p.render($.title._.text).withVine(_v.stream(this.renderTitle, this)),
    ];
  }

  renderCancelButtonClasses(vine: Vine): Observable<ImmutableSet<string>> {
    return $dialogState
        .get(vine)
        .pipe(
            map(dialogState => {
              if (!dialogState.isOpen || !dialogState.cancelable) {
                return createImmutableSet([]);
              }

              return createImmutableSet(['isVisible']);
            }),
        );
  }

  renderRootClasses(vine: Vine): Observable<ImmutableSet<string>> {
    return $dialogState.get(vine).pipe(map(dialogState => {
      if (dialogState.isOpen) {
        return createImmutableSet(['isVisible']);
      } else {
        return createImmutableSet();
      }
    }));
  }

  renderTitle(vine: Vine): Observable<string> {
    return $dialogState.get(vine).pipe(map(dialogState => {
      if (dialogState.isOpen) {
        return dialogState.title;
      } else {
        return '';
      }
    }));
  }

  setupOnCloseOrCancel(vine: Vine): Observable<unknown> {
    return merge(
        this.onCancelObs.pipe(mapTo(true)),
        this.onOkObs.pipe(mapTo(false)),
    )
    .pipe(
        withLatestFrom($dialogState.get(vine)),
        filter((pair): pair is [boolean, OpenState] => pair[1].isOpen),
        tap(([isCanceled, state]) => state.closeFn(isCanceled)),
    );
  }
}
