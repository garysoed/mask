import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, classToggle, element, hasAttribute, host, onDom, PersonaContext, stringParser, style, textContent } from 'persona';
import { combineLatest, merge, Observable } from 'rxjs';
import { map, mapTo, startWith } from 'rxjs/operators';

import { _p } from '../app/app';
import { $$ as $icon, Icon } from '../display/icon';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import template from './list-item.html';


export const $$ = {
  api: {
    icon: attributeIn('icon', stringParser(), ''),
    itemDetail: attributeIn('item-detail', stringParser(), ''),
    itemName: attributeIn('item-name', stringParser(), ''),
    selected: hasAttribute('selected'),
    toolWidth: attributeIn('tool-width', stringParser(), '0'),
  },
  tag: 'mk-list-item',
};

export const $ = {
  host: host({
    ...$$.api,
    onMouseOut: onDom('mouseout'),
    onMouseOver: onDom('mouseover'),
  }),
  icon: element('icon', $icon, {}),
  iconContainer: element('iconContainer', instanceofType(HTMLDivElement), {
    displayed: classToggle('displayed'),
  }),
  itemDetail: element('itemDetail', instanceofType(HTMLDivElement), {
    text: textContent(),
  }),
  itemDetailContainer: element('itemDetailContainer', instanceofType(HTMLDivElement), {
    displayed: classToggle('displayed'),
  }),
  itemName: element('itemName', instanceofType(HTMLDivElement), {
    text: textContent(),
  }),
  itemNameContainer: element('itemNameContainer', instanceofType(HTMLDivElement), {
    displayed: classToggle('displayed'),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    theme: attributeOut('mk-theme', stringParser()),
  }),
  tool: element('tool', instanceofType(HTMLDivElement), {
    width: style('width'),
  }),
};

@_p.customElement({
  ...$$,
  dependencies: [Icon],
  template,
})
export class ListItem extends ThemedCustomElementCtrl {
  private readonly iconObs = this.declareInput($.host._.icon);
  private readonly itemDetailObs = this.declareInput($.host._.itemDetail);
  private readonly itemNameObs = this.declareInput($.host._.itemName);
  // TODO: On hover
  private readonly onMouseOutObs = this.declareInput($.host._.onMouseOut);
  private readonly onMouseOverObs = this.declareInput($.host._.onMouseOver);
  private readonly toolWidthObs = this.declareInput($.host._.toolWidth);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.icon._.icon, this.iconObs);
    this.render($.itemDetail._.text, this.itemDetailObs);
    this.render($.itemName._.text, this.itemNameObs);
    this.render($.iconContainer._.displayed, this.renderIconContainerDisplayed());
    this.render($.itemDetailContainer._.displayed, this.renderItemDetailContainerDisplayed());
    this.render($.itemNameContainer._.displayed, this.renderItemNameContainerDisplayed());
    this.render($.tool._.width, this.renderToolWidth());
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

    return combineLatest([hoverObs, this.toolWidthObs])
        .pipe(map(([mouseHover, toolWidth]) => mouseHover ? toolWidth : '0'));
  }
}
