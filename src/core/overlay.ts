import { cache } from 'gs-tools/export/data';
import { debug } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { classToggle, element, host, onDom, PersonaContext } from 'persona';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import { $overlayService, ShowEvent } from './overlay-service';
import template from './overlay.html';

const LOGGER = new Logger('mask.Overlay');


export const $overlay = {
  tag: 'mk-overlay',
  api: {},
};

export const $ = {
  host: host($overlay.api),
  root: element('root', instanceofType(HTMLDivElement), {
    hidden: classToggle('hidden'),
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  ...$overlay,
  template,
})
export class Overlay extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.root._.hidden, this.isRootHidden$);
  }

  @cache()
  private get isRootHidden$(): Observable<boolean> {
    return this.showStatus$.pipe(map(showStatus => !showStatus));
  }

  @cache()
  private get showStatus$(): Observable<ShowEvent|null> {
    const onShow$ = $overlayService.get(this.vine).pipe(
        switchMap(service => service.onShow$),
        debug(LOGGER, 'onShow'),
    );

    const onClick$ = this.declareInput($.root._.onClick).pipe(
        withLatestFrom(this.declareInput($.root)),
        filter(([event, rootEl]) => event.target === rootEl),
        mapTo(null),
    );

    return merge(onShow$, onClick$).pipe(
        debug(LOGGER, 'merge'),
        startWith(null),
        shareReplay({bufferSize: 1, refCount: true}),
    );
  }
}
