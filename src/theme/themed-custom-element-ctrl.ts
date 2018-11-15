import { VineImpl } from 'grapevine/export/main';
import { ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from 'persona/export/locator';
import { CustomElementCtrl } from 'persona/export/main';
import { combineLatest } from 'rxjs';
import { $theme } from '../app/app';

type StyleElLocator = ResolvedRenderableWatchableLocator<HTMLStyleElement>|
    ResolvedWatchableLocator<HTMLStyleElement>;

export abstract class ThemedCustomElementCtrl extends CustomElementCtrl {
  constructor(private readonly styleElLocator_: StyleElLocator) {
    super();
  }

  init(vine: VineImpl): void {
    const styleElId = this.styleElLocator_.getReadingId();
    this.addSubscription(
        combineLatest(
            vine.getObservable(styleElId, this),
            vine.getObservable($theme),
        )
        .subscribe(([el, theme]) => theme.injectCss(el)),
    );
  }
}
