import { VineImpl } from 'grapevine/export/main';
import { InstanceofType } from 'gs-types/export';
import { element, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator, resolveLocators } from 'persona/export/locator';
import { CustomElementCtrl } from 'persona/export/main';
import { combineLatest } from 'rxjs';
import { $theme, _p } from '../app/app';

type StyleElLocator = ResolvedRenderableWatchableLocator<HTMLStyleElement>|
    ResolvedWatchableLocator<HTMLStyleElement>;

const $ = resolveLocators({
  theme: {
    el: element('#theme', InstanceofType(HTMLStyleElement)),
  },
});

@_p.baseCustomElement({
  watch: [$.theme.el],
})
export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  init(vine: VineImpl): void {
    this.addSubscription(
        combineLatest(
            vine.getObservable($.theme.el.getReadingId(), this),
            vine.getObservable($theme),
        )
        .subscribe(([el, theme]) => theme.injectCss(el)),
    );
  }
}
