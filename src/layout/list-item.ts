import { ElementWithTagType, InstanceofType } from '@gs-types';
import { api, attributeIn, attributeOut, classToggle, element, InitFn, innerHtml, onDom, style } from '@persona';
import { combineLatest, merge, Observable } from '@rxjs';
import { map, mapTo, startWith } from '@rxjs/operators';
import { _p, _v } from '../app/app';
import { $$ as $icon, Icon } from '../display/icon';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import template from './list-item.html';

export const $$ = {
  icon: attributeIn('icon', stringParser()),
  itemDetail: attributeIn('item-detail', stringParser()),
  itemName: attributeIn('item-name', stringParser()),
  // TODO: theme shouldn't be required.
  theme: attributeIn('theme', stringParser()),
  toolWidth: attributeIn('tool-width', stringParser()),
};

export const $ = {
  host: element({
    ...$$,
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
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
  root: element('root', InstanceofType(HTMLDivElement), {
    theme: attributeOut('mk-theme', stringParser()),
  }),
  tool: element('tool', InstanceofType(HTMLDivElement), {
    width: style('width'),
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
  // TODO: On hover
  private readonly onMouseOutObs = _p.input($.host._.onMouseOut, this);
  private readonly onMouseOverObs = _p.input($.host._.onMouseOver, this);
  private readonly themeObs = _p.input($.host._.theme, this);
  private readonly toolWidthObs = _p.input($.host._.toolWidth, this);

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
      _p.render($.root._.theme).withObservable(this.themeObs),
      _p.render($.tool._.width).withVine(_v.stream(this.renderToolWidth, this)),
    ];
  }

  private renderIconContainerDisplayed(): Observable<boolean> {
    return this.iconObs.pipe(map(icon => !!icon));
  }

  private renderItemDetailContainerDisplayed(): Observable<boolean> {
    return this.itemDetailObs.pipe(map(itemDetail => !!itemDetail));
  }

  private renderItemNameContainerDisplayed(): Observable<boolean> {
    return this.itemNameObs.pipe(map(itemName => !!itemName));
  }

  private renderToolWidth(): Observable<string> {
    const hoverObs = merge(
        this.onMouseOutObs.pipe(mapTo(false)),
        this.onMouseOverObs.pipe(mapTo(true)),
    )
    .pipe(startWith(false));

    return combineLatest(hoverObs, this.toolWidthObs)
        .pipe(map(([mouseHover, toolWidth]) => mouseHover ? toolWidth : '0'));
  }
}
