import { ElementWithTagType, InstanceofType } from 'gs-types/export';
import { attributeIn, element } from 'persona/export/input';
import { api } from 'persona/export/main';
import { classToggle, innerHtml } from 'persona/export/output';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p } from '../app/app';
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
@_p.render($.icon._.icon).withForwarding($.host._.icon)
@_p.render($.itemDetail._.innerHtml).withForwarding($.host._.itemDetail)
@_p.render($.itemName._.innerHtml).withForwarding($.host._.itemName)
export class ListItem extends ThemedCustomElementCtrl {
  @_p.render($.iconContainer._.displayed)
  renderIconContainerDisplayed(
      @_p.input($.host._.icon) iconObs: Observable<string>,
  ): Observable<boolean> {
    return iconObs.pipe(map(icon => !!icon));
  }

  @_p.render($.itemDetailContainer._.displayed)
  renderItemDetailContainerDisplayed(
      @_p.input($.host._.itemDetail) itemDetailObs: Observable<string>,
  ): Observable<boolean> {
    return itemDetailObs.pipe(map(itemDetail => !!itemDetail));
  }

  @_p.render($.itemNameContainer._.displayed)
  renderItemNameContainerDisplayed(
      @_p.input($.host._.itemName) itemNameObs: Observable<string>,
  ): Observable<boolean> {
    return itemNameObs.pipe(map(itemName => !!itemName));
  }
}
