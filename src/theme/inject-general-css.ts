import { VineImpl } from 'grapevine/export/main';
import { ResolvedWatchableLocator } from 'persona/export/locator';
import { CustomElementCtrl } from 'persona/export/main';
import * as generalCss from './general.css';

export function injectGeneralCss(
    vine: VineImpl,
    ctrl: CustomElementCtrl,
    styleElLocator: ResolvedWatchableLocator<HTMLStyleElement>): void {
  vine.listen(
      el => {
        el.innerHTML = generalCss;
      },
      ctrl,
      styleElLocator.getReadingId());
}
