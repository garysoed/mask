import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BooleanParser } from 'gs-tools/export/parse';
import { BooleanType, ElementWithTagType, InstanceofType } from 'gs-types/export';
import { attribute, element, resolveLocators } from 'persona/export/locator';
import { ThemedCustomElementCtrl } from '../src/theme/themed-custom-element-ctrl';
import { demoApp } from './demo-app';
import demoTemplate from './demo.html';

const $ = resolveLocators({
  option: {
    el: element<HTMLElement|null>('#option', ElementWithTagType('mk-drawer')),
    expanded: attribute(element('option.el'), 'expanded', BooleanParser, BooleanType, false),
  },
  themeStyle: element('#theme', InstanceofType(HTMLStyleElement)),
});

const $isOnOption = instanceSourceId('isOnOption', BooleanType);
demoApp.vine.builder.source($isOnOption, false);

@demoApp.persona.customElement({
  tag: 'mk-demo',
  template: demoTemplate,
  watch: [
    $.option.el,
    $.themeStyle,
  ],
})
@demoApp.persona.render($.option.expanded).withForwarding($isOnOption)
export class DemoCtrl extends ThemedCustomElementCtrl {
  constructor() {
    super($.themeStyle);
  }

  @demoApp.persona.onDom($.option.el, 'mouseout')
  onMouseOutOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, false, this);
  }

  @demoApp.persona.onDom($.option.el, 'mouseover')
  onMouseOverOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, true, this);
  }
}
