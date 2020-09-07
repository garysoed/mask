import { Vine } from 'grapevine';
import { $asMap, $map, $pipe } from 'gs-tools/export/collect';
import { elementWithTagType, instanceofType } from 'gs-types';
import { classlist, element, onDom, PersonaContext, renderElement, single, textContent } from 'persona';
import { merge, Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, switchMap, withLatestFrom } from 'rxjs/operators';

import { $$ as $textIconButton, TextIconButton } from '../action/deprecated/text-icon-button';
import { _p } from '../app/app';
import dialogCloseSvg from '../asset/dialog_close.svg';
import dialogConfirmSvg from '../asset/dialog_confirm.svg';
import { registerSvg } from '../core/svg-service';
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
    registerSvg(vine, 'dialog_close', {type: 'embed', content: dialogCloseSvg});
    registerSvg(vine, 'dialog_confirm', {type: 'embed', content: dialogConfirmSvg});
  },
  dependencies: [
    TextIconButton,
  ],
  tag: 'mk-dialog',
  template: dialogTemplate,
  api: {},
})
export class Dialog extends ThemedCustomElementCtrl {
  private readonly onCancelObs = this.declareInput($.cancelButton._.onAction);
  private readonly onOkObs = this.declareInput($.okButton._.onAction);

  constructor(context: PersonaContext) {
    super(context);

    this.addSetup(this.setupOnCloseOrCancel());
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

  private renderContent(): Observable<Node|null> {
    return $dialogState.get(this.vine)
        .pipe(
            switchMap(state => {
              if (!state.isOpen) {
                return observableOf(null);
              }

              const attrs = $pipe(
                  state.spec.content.attr || new Map(),
                  $map(([key, value]) => {
                    return [key, observableOf(value)] as [string, Observable<string>];
                  }),
                  $asMap(),
              );

              return renderElement(state.spec.content.tag, {attrs}, this.context);
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

  private setupOnCloseOrCancel(): Observable<unknown> {
    return merge(
        this.onCancelObs.pipe(mapTo(true)),
        this.onOkObs.pipe(mapTo(false)),
    )
    .pipe(
        withLatestFrom($dialogState.get(this.vine)),
        filter((pair): pair is [boolean, OpenState] => pair[1].isOpen),
        switchMap(([isCanceled, state]) => state.closeFn(isCanceled)),
    );
  }
}
