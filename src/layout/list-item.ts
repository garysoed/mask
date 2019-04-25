import { ElementWithTagType, InstanceofType } from '@gs-types';
import { api, attributeIn, classToggle, element, InitFn, innerHtml } from '@persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $$ as $icon, Icon } from '../display/icon';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import template from './list-item.html';

export const $$ = {
  icon: attributeIn('icon', stringParser()),
  itemDetail: attributeIn('item-detail', stringParser()),
  itemName: attributeIn('item-name', stringParser()),
};

export const $ = {
  host: element($$),
  icon: element('icon', ElementWithTagType('mk-icon'), api($icon)),
  iconContainer: element('iconContainer', InstanceofType(HTMLDivElement), {
    displayed: classToggle('displayed'),
  }),
  itemDetail: element('itemDetail', InstanceofType(HTMLDivElement), {
    innerHtml: innerHtml(),
  }),
  itemDetailContainer: element('itemDetailContainer', InstanceofType(HTMLDivElement), {
    displayed: classToggle('displayed'),
  }),
  itemName: element('itemName', InstanceofType(HTMLDivElement), {
    innerHtml: innerHtml(),
  }),
  itemNameContainer: element('itemNameContainer', InstanceofType(HTMLDivElement), {
    displayed: classToggle('displayed'),
  }),
};

@_p.customElement({
  dependencies: [Icon],
  tag: 'mk-list-item',
  template,
})
export class ListItem extends ThemedCustomElementCtrl {
  private readonly iconObs = _p.input($.host._.icon, this);
  private readonly itemDetailObs = _p.input($.host._.itemDetail, this);
  private readonly itemNameObs = _p.input($.host._.itemName, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.icon._.icon).withObservable(this.iconObs),
      _p.render($.itemDetail._.innerHtml).withObservable(this.itemDetailObs),
      _p.render($.itemName._.innerHtml).withObservable(this.itemNameObs),
      _p.render($.iconContainer._.displayed)
          .withVine(_v.stream(this.renderIconContainerDisplayed, this)),
      _p.render($.itemDetailContainer._.displayed)
          .withVine(_v.stream(this.renderItemDetailContainerDisplayed, this)),
      _p.render($.itemNameContainer._.displayed)
          .withVine(_v.stream(this.renderItemNameContainerDisplayed, this)),
    ];
  }

  renderIconContainerDisplayed(): Observable<boolean> {
    return this.iconObs.pipe(map(icon => !!icon));
  }

  renderItemDetailContainerDisplayed(): Observable<boolean> {
    return this.itemDetailObs.pipe(map(itemDetail => !!itemDetail));
  }

  renderItemNameContainerDisplayed(): Observable<boolean> {
    return this.itemNameObs.pipe(map(itemName => !!itemName));
  }
}
