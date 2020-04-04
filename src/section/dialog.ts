import { Vine } from 'grapevine';
import { elementWithTagType, instanceofType } from 'gs-types';
import { classlist, element, onDom, PersonaContext, RenderSpec, SimpleElementRenderSpec, single, textContent } from 'persona';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { $$ as $textIconButton, TextIconButton } from '../action/text-icon-button';
import { _p, _v } from '../app/app';
import dialogCloseSvg from '../asset/dialog_close.svg';
import dialogConfirmSvg from '../asset/dialog_confirm.svg';
import { $svgConfig } from '../display/svg-service';
import { ACTION_EVENT } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import { $dialogState, OpenState } from './dialog-service';
import dialogTemplate from './dialog.html';

export const $ = {
  cancelButton: element('cancelButton', $textIconButton, {
    classlist: classlist(),
    onAction: onDom(ACTION_EVENT),
  }),
  content: element('content', instanceofType(HTMLDivElement), {
    single: single('#content'),
  }),
  okButton: element('okButton', $textIconButton, {
    onAction: onDom(ACTION_EVENT),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    classlist: classlist(),
  }),
  title: element('title', elementWithTagType('h3'), {
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
  dependencies: [
    TextIconButton,
  ],
  tag: 'mk-dialog',
  template: dialogTemplate,
})
export class Dialog extends ThemedCustomElementCtrl {
  private readonly onCancelObs = this.declareInput($.cancelButton._.onAction);
  private readonly onOkObs = this.declareInput($.okButton._.onAction);

  constructor(context: PersonaContext) {
    super(context);

    this.setupOnCloseOrCancel();
    this.render($.cancelButton._.classlist, this.renderCancelButtonClasses());
    this.render($.root._.classlist, this.renderRootClasses());
    this.render($.title._.text, this.renderTitle());
    this.render($.content._.single, this.renderContent());
  }

  private renderCancelButtonClasses(): Observable<ReadonlySet<string>> {
    return $dialogState.get(this.vine)
        .pipe(
            map(dialogState => {
              if (!dialogState.isOpen || !dialogState.spec.cancelable) {
                return new Set([]);
              }

              return new Set(['isVisible']);
            }),
        );
  }

  private renderContent(): Observable<RenderSpec|null> {
    return $dialogState.get(this.vine)
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

  private renderRootClasses(): Observable<ReadonlySet<string>> {
    return $dialogState.get(this.vine).pipe(map(dialogState => {
      if (dialogState.isOpen) {
        return new Set(['isVisible']);
      } else {
        return new Set();
      }
    }));
  }

  private renderTitle(): Observable<string> {
    return $dialogState.get(this.vine).pipe(map(dialogState => {
      if (dialogState.isOpen) {
        return dialogState.spec.title;
      } else {
        return '';
      }
    }));
  }

  private setupOnCloseOrCancel(): void {
    merge(
        this.onCancelObs.pipe(mapTo(true)),
        this.onOkObs.pipe(mapTo(false)),
    )
    .pipe(
        withLatestFrom($dialogState.get(this.vine)),
        filter((pair): pair is [boolean, OpenState] => pair[1].isOpen),
        switchMap(([isCanceled, state]) => state.closeFn(isCanceled)),
        takeUntil(this.onDispose$),
    )
    .subscribe();
  }
}
