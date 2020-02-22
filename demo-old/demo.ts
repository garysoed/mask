import { Jsons } from 'gs-tools/export/data';

import { $dialogService, $svgConfig, Breadcrumb, Checkbox, CroppedLine, Dialog, Drawer, Icon, IconWithText, LayoutOverlay, ListItem, Palette, start as startMask, TextIconButton, TextInput, Theme } from '../export';

import highlightSvg from './asset/highlight.svg';
import maskSvg from './asset/mask.svg';
import paletteSvg from './asset/palette.svg';
import { DemoCtrl } from './demo-ctrl';

const theme = new Theme(Palette.ORANGE, Palette.GREEN);

window.addEventListener('load', () => {
  const {vine} = startMask(
      'demo',
      [
        Breadcrumb,
        Checkbox,
        CroppedLine,
        DemoCtrl,
        Dialog,
        Drawer,
        Icon,
        IconWithText,
        LayoutOverlay,
        ListItem,
        TextIconButton,
        TextInput,
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);

  const svgConfigSbj = $svgConfig.get(vine);
  const icons = [
    {key: 'highlight', content: highlightSvg},
    {key: 'logo', content: maskSvg},
    {key: 'palette', content: paletteSvg},
  ];
  for (const {key, content} of icons) {
    svgConfigSbj.next({key, type: 'set', value: {type: 'embed', content}});
  }

  $dialogService.get(vine).subscribe(service => {
    Jsons.setValue(window, 'demo.dialogService', service);
  });
});
