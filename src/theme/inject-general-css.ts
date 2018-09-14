import { InstanceSourceId, InstanceStreamId, NodeId, StaticSourceId, StaticStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { Errors } from 'gs-tools/src/error';
import { CustomElementCtrl } from 'persona/export/main';
import { $theme } from '../app/app';

export function injectGeneralCss(
    vine: VineImpl,
    styleElId: StaticSourceId<HTMLStyleElement>|StaticStreamId<HTMLStyleElement>): void;
export function injectGeneralCss(
    vine: VineImpl,
    styleElId: InstanceSourceId<HTMLStyleElement>|InstanceStreamId<HTMLStyleElement>,
    context: CustomElementCtrl): void;
export function injectGeneralCss(
    vine: VineImpl,
    styleElId: NodeId<HTMLStyleElement>,
    context?: CustomElementCtrl): void {
  if (styleElId instanceof StaticSourceId || styleElId instanceof StaticStreamId) {
    vine.listen((el, theme) => theme.injectCss(el), styleElId, $theme);
  } else {
    if (!context) {
      throw Errors.assert('context').shouldExist().butNot();
    }
    vine.listen((el, theme) => theme.injectCss(el), context, styleElId, $theme);
  }
}
