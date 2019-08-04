import { Vine } from '@grapevine';
import { createImmutableSet, ImmutableSet } from '@gs-tools/collect';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { classlist, element, InitFn, onDom, RenderSpec, SimpleElementRenderSpec, single, textContent } from '@persona';
import { merge, Observable } from '@rxjs';
import { filter, map, mapTo, switchMap, withLatestFrom } from '@rxjs/operators';

import { _p, _v } from '../app/app';
import dialogCloseSvg from '../asset/dialog_close.svg';
import dialogConfirmSvg from '../asset/dialog_confirm.svg';
import { $svgConfig } from '../display/svg-service';
import { ACTION_EVENT } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import { $dialogState, OpenState } from './dialog-service';
import dialogTemplate from './dialog.html';

export const $ = {
  cancelButton: element('cancelButton', ElementWithTagType('mk-text-icon-button'), {
    classlist: classlist(),
    onAction: onDom(ACTION_EVENT),
  }),
  content: element('content', InstanceofType(HTMLDivElement), {
    single: single('#content'),
  }),
  okButton: element('okButton', ElementWithTagType('mk-text-icon-button'), {
    onAction: onDom(ACTION_EVENT),
  }),
  root: element('root', InstanceofType(HTMLDivElement), {
    classlist: classlist(),
  }),
  title: element('title', ElementWithTagType('h3'), {
    text: textContent(),
  }),
};

@_p.customElement({
  configure(vine: Vine): void {
    const svgSubject = $svgConfig.get(vine);
    svgSubject.next({
      key: 'dialog_close',
      type: 'set',
      value: {type: 'embed', content: dialogCloseSvg},
    });
    svgSubject.next({
      key: 'dialog_confirm',
      type: 'set',
      value: {type: 'embed', content: dialogConfirmSvg},
    });
  },
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
      _p.render($.content._.single).withVine(_v.stream(this.renderContent, this)),
    ];
  }

  private renderCancelButtonClasses(vine: Vine): Observable<ImmutableSet<string>> {
    return $dialogState
        .get(vine)
        .pipe(
            map(dialogState => {
              if (!dialogState.isOpen || !dialogState.spec.cancelable) {
                return createImmutableSet([]);
              }

              return createImmutableSet(['isVisible']);
            }),
        );
  }

  private renderContent(vine: Vine): Observable<RenderSpec|null> {
    return $dialogState.get(vine)
        .pipe(
            map(state => {
              if (!state.isOpen) {
                return null;
              }

              return new SimpleElementRenderSpec(
                  state.spec.content.tag,
                  state.spec.content.attr || new Map(),
              );
            }),
        );
  }

  private renderRootClasses(vine: Vine): Observable<ImmutableSet<string>> {
    return $dialogState.get(vine).pipe(map(dialogState => {
      if (dialogState.isOpen) {
        return createImmutableSet(['isVisible']);
      } else {
        return createImmutableSet();
      }
    }));
  }

  private renderTitle(vine: Vine): Observable<string> {
    return $dialogState.get(vine).pipe(map(dialogState => {
      if (dialogState.isOpen) {
        return dialogState.spec.title;
      } else {
        return '';
      }
    }));
  }

  private setupOnCloseOrCancel(vine: Vine): Observable<unknown> {
    return merge(
        this.onCancelObs.pipe(mapTo(true)),
        this.onOkObs.pipe(mapTo(false)),
    )
    .pipe(
        withLatestFrom($dialogState.get(vine)),
        filter((pair): pair is [boolean, OpenState] => pair[1].isOpen),
        switchMap(([isCanceled, state]) => state.closeFn(isCanceled)),
    );
  }
}
